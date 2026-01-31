/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-redundant-type-constituents -- ESLint rule file */
import type { TSESTree } from '@typescript-eslint/types';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';

type MessageIds = 'typeAssertionFound';

type Options = [
  {
    allowedInFiles?: string[];
    customMessage?: string;
  }
];

export default {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Detect and warn on TypeScript type assertion (casting) usage',
      recommended: 'warn' as const,
    },
    messages: {
      typeAssertionFound:
        "Type assertion (cast) used: '{{typeText}}'. Prefer type-safe alternatives where possible.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedInFiles: {
            type: 'array',
            items: { type: 'string' },
            description: 'File patterns where type assertions are allowed',
          },
          customMessage: {
            type: 'string',
            description:
              'Custom message. Use {{typeText}} as placeholder for the asserted type.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowedInFiles: [],
      customMessage: undefined,
    },
  ] as Options,
  create(
    context: RuleContext<MessageIds, Options>,
    [options = { allowedInFiles: [] }]: Options
  ) {
    const sourceCode = context.sourceCode;

    function getTypeText(typeAnnotation: TSESTree.TSType): string {
      return sourceCode.getText(typeAnnotation);
    }

    function isAllowedFile(fileName: string): boolean {
      if (!options.allowedInFiles?.length) return false;
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

    function report(node: TSESTree.Node, typeText: string): void {
      const fileName = (context as { filename?: string }).filename ?? '';
      if (isAllowedFile(fileName)) return;

      if (options.customMessage) {
        context.report({
          node,
          message: options.customMessage.replace(/\{\{typeText\}\}/g, typeText),
        });
      } else {
        context.report({
          node,
          messageId: 'typeAssertionFound',
          data: { typeText },
        });
      }
    }

    return {
      TSAsExpression(node: TSESTree.TSAsExpression) {
        const typeText = getTypeText(node.typeAnnotation);
        report(node, typeText);
      },
      TSTypeAssertion(node: TSESTree.TSTypeAssertion) {
        const typeText = getTypeText(node.typeAnnotation);
        report(node, typeText);
      },
    };
  },
};
