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

export default {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Detect and report usage of @deprecated items',
      recommended: 'error' as const,
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
  ] as Options,
  create(
    context: RuleContext<MessageIds, Options>,
    [options = { reportUsage: true, allowedInFiles: [] }]: Options
  ) {
    interface SourceCode {
      parserServices?: {
        program?: ts.Program;
        esTreeNodeToTSNodeMap?: Map<TSESTree.Node, ts.Node>;
        tsNodeToESTreeNodeMap?: Map<ts.Node, TSESTree.Node>;
      };
      getCommentsBefore(node: TSESTree.Node): { type: string; value?: string }[];
    }

    const sourceCode = context.sourceCode as SourceCode;
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
        return (node as TSESTree.Identifier).name;
      }
      if (node.type === 'MemberExpression') {
        const property = (node as TSESTree.MemberExpression).property;
        if (property.type === 'Identifier') {
          return (property as TSESTree.Identifier).name;
        }
      }
      if (node.type === 'PropertyDefinition') {
        const key = (node as TSESTree.PropertyDefinition).key;
        if (key.type === 'Identifier') {
          return (key as TSESTree.Identifier).name;
        }
      }
      if (node.type === 'MethodDefinition') {
        const key = (node as TSESTree.MethodDefinition).key;
        if (key.type === 'Identifier') {
          return (key as TSESTree.Identifier).name;
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

    function checkDeprecatedUsage(
      node: TSESTree.Node,
      identifierName: string
    ): void {
      if (!options.reportUsage) return;

      const fileName = (context as { filename?: string }).filename ?? '';
      if (isAllowedFile(fileName)) return;

      if (!parserServices.esTreeNodeToTSNodeMap) return;
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (!tsNode) return;

      try {
        const symbol = checker.getSymbolAtLocation(tsNode);
        if (!symbol) return;

        const declarations = symbol.getDeclarations();
        if (!declarations || declarations.length === 0) return;

        for (const declaration of declarations) {
          if (!parserServices.tsNodeToESTreeNodeMap) continue;
          const esTreeNode = parserServices.tsNodeToESTreeNodeMap.get(declaration);
          if (!esTreeNode) continue;

          const deprecated = extractDeprecatedFromJSDoc(esTreeNode);
          if (deprecated) {
            if (options.customMessage) {
              context.report({
                node,
                message: formatCustomMessage(
                  options.customMessage,
                  identifierName,
                  deprecated.reason
                ),
              });
            } else {
              context.report({
                node,
                messageId: 'deprecatedUsage',
                data: {
                  name: identifierName,
                },
              });
            }
            return;
          }

          const declarationSymbol = (declaration as ts.Declaration & { symbol?: ts.Symbol }).symbol;
          if (declarationSymbol) {
            const jsDocTags = declarationSymbol.getJsDocTags();
            const deprecatedTag = jsDocTags.find(
              (tag) => tag.name === 'deprecated'
            );
            if (deprecatedTag) {
              if (options.customMessage) {
                context.report({
                  node,
                  message: formatCustomMessage(
                    options.customMessage,
                    identifierName
                  ),
                });
              } else {
                context.report({
                  node,
                  messageId: 'deprecatedUsage',
                  data: {
                    name: identifierName,
                  },
                });
              }
              return;
            }
          }
        }
      } catch {
        // Ignore type checking errors
      }
    }

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id?.name ?? 'Unknown';
          deprecatedItems.set(name, { node, reason: deprecated.reason });
          if (options.customMessage) {
            context.report({
              node: node.id ?? node,
              message: formatCustomMessage(
                options.customMessage,
                name,
                deprecated.reason
              ),
            });
          } else {
            context.report({
              node: node.id ?? node,
              messageId: 'deprecatedFound',
              data: {
                name,
                reason: deprecated.reason ? `: ${deprecated.reason}` : '',
              },
            });
          }
        }
      },
      MethodDefinition(node: TSESTree.MethodDefinition) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = getNodeName(node) ?? 'Unknown';
          deprecatedItems.set(name, { node, reason: deprecated.reason });
          if (options.customMessage) {
            context.report({
              node: node.key,
              message: formatCustomMessage(
                options.customMessage,
                name,
                deprecated.reason
              ),
            });
          } else {
            context.report({
              node: node.key,
              messageId: 'deprecatedFound',
              data: {
                name,
                reason: deprecated.reason ? `: ${deprecated.reason}` : '',
              },
            });
          }
        }
      },
      PropertyDefinition(node: TSESTree.PropertyDefinition) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = getNodeName(node) ?? 'Unknown';
          deprecatedItems.set(name, { node, reason: deprecated.reason });
          if (options.customMessage) {
            context.report({
              node: node.key,
              message: formatCustomMessage(
                options.customMessage,
                name,
                deprecated.reason
              ),
            });
          } else {
            context.report({
              node: node.key,
              messageId: 'deprecatedFound',
              data: {
                name,
                reason: deprecated.reason ? `: ${deprecated.reason}` : '',
              },
            });
          }
        }
      },
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id?.name ?? 'Unknown';
          deprecatedItems.set(name, { node, reason: deprecated.reason });
          if (options.customMessage) {
            context.report({
              node: node.id ?? node,
              message: formatCustomMessage(
                options.customMessage,
                name,
                deprecated.reason
              ),
            });
          } else {
            context.report({
              node: node.id ?? node,
              messageId: 'deprecatedFound',
              data: {
                name,
                reason: deprecated.reason ? `: ${deprecated.reason}` : '',
              },
            });
          }
        }
      },
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (node.id.type === 'Identifier') {
          const deprecated = extractDeprecatedFromJSDoc(node);
          if (deprecated) {
            const name = (node.id as TSESTree.Identifier).name;
            deprecatedItems.set(name, { node, reason: deprecated.reason });
            if (options.customMessage) {
              context.report({
                node: node.id,
                message: formatCustomMessage(
                  options.customMessage,
                  name,
                  deprecated.reason
                ),
              });
            } else {
              context.report({
                node: node.id,
                messageId: 'deprecatedFound',
                data: {
                  name,
                  reason: deprecated.reason ? `: ${deprecated.reason}` : '',
                },
              });
            }
          }
        }
      },
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id.name;
          deprecatedItems.set(name, { node, reason: deprecated.reason });
          if (options.customMessage) {
            context.report({
              node: node.id,
              message: formatCustomMessage(
                options.customMessage,
                name,
                deprecated.reason
              ),
            });
          } else {
            context.report({
              node: node.id,
              messageId: 'deprecatedFound',
              data: {
                name,
                reason: deprecated.reason ? `: ${deprecated.reason}` : '',
              },
            });
          }
        }
      },
      TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id.name;
          deprecatedItems.set(name, { node, reason: deprecated.reason });
          if (options.customMessage) {
            context.report({
              node: node.id,
              message: formatCustomMessage(
                options.customMessage,
                name,
                deprecated.reason
              ),
            });
          } else {
            context.report({
              node: node.id,
              messageId: 'deprecatedFound',
              data: {
                name,
                reason: deprecated.reason ? `: ${deprecated.reason}` : '',
              },
            });
          }
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
          const property = node.property as TSESTree.Identifier;
          checkDeprecatedUsage(node, property.name);
        }
      },
    };
  },
};
