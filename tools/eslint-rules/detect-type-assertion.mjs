export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect and warn on TypeScript type assertion (casting) usage',
      recommended: 'warn',
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
  ],
  create(context, optionsWithDefaults) {
    const options = optionsWithDefaults?.[0] ?? { allowedInFiles: [] };
    const sourceCode = context.sourceCode;

    function getTypeText(typeAnnotation) {
      return sourceCode.getText(typeAnnotation);
    }

    function isAllowedFile(fileName) {
      if (!options.allowedInFiles?.length) return false;
      return options.allowedInFiles.some((pattern) => {
        if (pattern.includes('*')) {
          const regex = new RegExp(
            pattern.replace(/\*/g, '.*').replace(/\//g, '\\/')
          );
          return regex.test(fileName);
        }
        return fileName.includes(pattern);
      });
    }

    function report(node, typeText) {
      const fileName = context.filename ?? '';
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
      TSAsExpression(node) {
        const typeText = getTypeText(node.typeAnnotation);
        report(node, typeText);
      },
      TSTypeAssertion(node) {
        const typeText = getTypeText(node.typeAnnotation);
        report(node, typeText);
      },
    };
  },
};
