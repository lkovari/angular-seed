/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument -- ESLint rule file working with TypeScript compiler APIs */
import type { TSESTree } from '@typescript-eslint/types';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';

type MessageIds = 'deprecatedFound' | 'deprecatedUsage';

type Options = [
  {
    reportUsage?: boolean;
    allowedInFiles?: string[];
    customMessage?: string;
  }
];

interface DeprecatedRuleSourceCode {
  parserServices?: {
    program?: ts.Program;
    esTreeNodeToTSNodeMap?: Map<TSESTree.Node, ts.Node>;
    tsNodeToESTreeNodeMap?: Map<ts.Node, TSESTree.Node>;
  };
  getCommentsBefore(node: TSESTree.Node): { type: string; value?: string }[];
}

function isDeprecatedRuleSourceCode(
  sourceCode: RuleContext<MessageIds, Options>['sourceCode']
): sourceCode is DeprecatedRuleSourceCode {
  return (
    'parserServices' in sourceCode &&
    'getCommentsBefore' in sourceCode &&
    typeof sourceCode.getCommentsBefore === 'function'
  );
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect and report usage of @deprecated items',
      recommended: 'error',
    },
    messages: {
      deprecatedFound:
        "'{{name}}' is marked as @deprecated{{reason}}. Consider using an alternative.",
      deprecatedUsage:
        "Usage of deprecated '{{name}}' found. Consider using an alternative.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          reportUsage: {
            type: 'boolean',
            description: 'Report when deprecated items are used',
            default: true,
          },
          allowedInFiles: {
            type: 'array',
            items: { type: 'string' },
            description: 'File patterns where deprecated items are allowed',
          },
          customMessage: {
            type: 'string',
            description: 'Custom message template for deprecated usage. Use {{name}} and {{reason}} as placeholders.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      reportUsage: true,
      allowedInFiles: [],
      customMessage: undefined,
    },
  ] satisfies Options,
  create(
    context: RuleContext<MessageIds, Options>,
    [options]: Options
  ) {
    if (!isDeprecatedRuleSourceCode(context.sourceCode)) {
      return {};
    }

    const sourceCode = context.sourceCode;
    const parserServices = sourceCode.parserServices;

    if (!parserServices?.program) {
      return {};
    }

    const checker = parserServices.program.getTypeChecker();
    const deprecatedItems = new Map<
      string,
      { node: TSESTree.Node; reason?: string }
    >();

    function formatCustomMessage(
      template: string,
      name: string,
      reason?: string
    ): string {
      return template
        .replace(/\{\{name\}\}/g, name)
        .replace(/\{\{reason\}\}/g, reason ?? '');
    }

    function extractDeprecatedFromJSDoc(
      node: TSESTree.Node
    ): { reason?: string } | null {
      const comments = sourceCode.getCommentsBefore(node);

      for (const comment of comments) {
        if (comment.type !== 'Block' || !comment.value) continue;

        const regex = /@deprecated\s*(.*?)(?:\n|$)/i;
        const jsdocMatch = regex.exec(comment.value);
        if (jsdocMatch) {
          const reason = jsdocMatch[1]?.trim();
          return { reason: reason ?? undefined };
        }
      }

      return null;
    }

    function getNodeName(node: TSESTree.Node): string | null {
      if (node.type === 'Identifier') {
        return node.name;
      }
      if (node.type === 'MemberExpression') {
        const property = node.property;
        if (property.type === 'Identifier') {
          return property.name;
        }
      }
      if (node.type === 'PropertyDefinition') {
        const key = node.key;
        if (key.type === 'Identifier') {
          return key.name;
        }
      }
      if (node.type === 'MethodDefinition') {
        const key = node.key;
        if (key.type === 'Identifier') {
          return key.name;
        }
      }
      return null;
    }

    function isAllowedFile(fileName: string): boolean {
      if (!options.allowedInFiles || options.allowedInFiles.length === 0) {
        return false;
      }
      return options.allowedInFiles.some((pattern: string) => {
        if (pattern.includes('*')) {
          const regex = new RegExp(
            pattern.replace(/\*/g, '.*').replace(/\//g, '\\/')
          );
          return regex.test(fileName);
        }
        return fileName.includes(pattern);
      });
    }

    function reportDeprecatedUsage(
      node: TSESTree.Node,
      identifierName: string,
      reason?: string
    ): void {
      if (options.customMessage) {
        context.report({
          node,
          message: formatCustomMessage(
            options.customMessage,
            identifierName,
            reason
          ),
        });
        return;
      }

      context.report({
        node,
        messageId: 'deprecatedUsage',
        data: {
          name: identifierName,
        },
      });
    }

    function reportDeprecatedDeclaration(
      node: TSESTree.Node,
      name: string,
      reason?: string
    ): void {
      if (options.customMessage) {
        context.report({
          node,
          message: formatCustomMessage(options.customMessage, name, reason),
        });
        return;
      }

      context.report({
        node,
        messageId: 'deprecatedFound',
        data: {
          name,
          reason: reason ? `: ${reason}` : '',
        },
      });
    }

    function checkDeclarationForDeprecated(
      declaration: ts.Declaration,
      node: TSESTree.Node,
      identifierName: string
    ): boolean {
      if (!parserServices.tsNodeToESTreeNodeMap) {
        return false;
      }

      const esTreeNode = parserServices.tsNodeToESTreeNodeMap.get(declaration);
      if (!esTreeNode) {
        return false;
      }

      const deprecated = extractDeprecatedFromJSDoc(esTreeNode);
      if (deprecated) {
        reportDeprecatedUsage(node, identifierName, deprecated.reason);
        return true;
      }

      const declarationSymbol = checker.getSymbolAtLocation(declaration);
      if (!declarationSymbol) {
        return false;
      }

      const deprecatedTag = declarationSymbol
        .getJsDocTags()
        .find((tag) => tag.name === 'deprecated');
      if (!deprecatedTag) {
        return false;
      }

      reportDeprecatedUsage(node, identifierName);
      return true;
    }

    function checkDeprecatedUsage(
      node: TSESTree.Node,
      identifierName: string
    ): void {
      if (!options.reportUsage) return;

      if (isAllowedFile(context.filename)) return;

      if (!parserServices.esTreeNodeToTSNodeMap) return;
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (!tsNode) return;

      try {
        const symbol = checker.getSymbolAtLocation(tsNode);
        if (!symbol) return;

        const declarations = symbol.getDeclarations();
        if (!declarations || declarations.length === 0) return;

        for (const declaration of declarations) {
          if (checkDeclarationForDeprecated(declaration, node, identifierName)) {
            return;
          }
        }
      } catch {
        // Ignore type checking errors
      }
    }

    function reportDeprecatedDefinition(
      node: TSESTree.Node,
      reportNode: TSESTree.Node,
      name: string,
      reason?: string
    ): void {
      deprecatedItems.set(name, { node, reason });
      reportDeprecatedDeclaration(reportNode, name, reason);
    }

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id?.name ?? 'Unknown';
          reportDeprecatedDefinition(
            node,
            node.id ?? node,
            name,
            deprecated.reason
          );
        }
      },
      MethodDefinition(node: TSESTree.MethodDefinition) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = getNodeName(node) ?? 'Unknown';
          reportDeprecatedDefinition(
            node,
            node.key,
            name,
            deprecated.reason
          );
        }
      },
      PropertyDefinition(node: TSESTree.PropertyDefinition) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = getNodeName(node) ?? 'Unknown';
          reportDeprecatedDefinition(
            node,
            node.key,
            name,
            deprecated.reason
          );
        }
      },
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id?.name ?? 'Unknown';
          reportDeprecatedDefinition(
            node,
            node.id ?? node,
            name,
            deprecated.reason
          );
        }
      },
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (node.id.type === 'Identifier') {
          const deprecated = extractDeprecatedFromJSDoc(node);
          if (deprecated) {
            const name = node.id.name;
            reportDeprecatedDefinition(
              node,
              node.id,
              name,
              deprecated.reason
            );
          }
        }
      },
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id.name;
          reportDeprecatedDefinition(
            node,
            node.id,
            name,
            deprecated.reason
          );
        }
      },
      TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id.name;
          reportDeprecatedDefinition(
            node,
            node.id,
            name,
            deprecated.reason
          );
        }
      },
      Identifier(node: TSESTree.Identifier) {
        if (options.reportUsage && node.name) {
          checkDeprecatedUsage(node, node.name);
        }
      },
      MemberExpression(node: TSESTree.MemberExpression) {
        if (
          options.reportUsage &&
          node.property.type === 'Identifier'
        ) {
          checkDeprecatedUsage(node, node.property.name);
        }
      },
    };
  },
};
