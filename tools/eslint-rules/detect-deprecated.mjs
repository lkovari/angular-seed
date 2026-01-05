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
  ],
  create(context, optionsWithDefaults) {
    const options = (optionsWithDefaults && optionsWithDefaults[0]) || { reportUsage: true, allowedInFiles: [] };
    const parserServices = context.sourceCode.parserServices;
    if (!parserServices || !parserServices.program) {
      return {};
    }

    const checker = parserServices.program.getTypeChecker();
    const deprecatedItems = new Map();

    function formatCustomMessage(template, name, reason) {
      return template
        .replace(/\{\{name\}\}/g, name)
        .replace(/\{\{reason\}\}/g, reason || '');
    }

    function extractDeprecatedFromJSDoc(node) {
      const sourceCode = context.sourceCode;
      const comments = sourceCode.getCommentsBefore(node);

      for (const comment of comments) {
        if (comment.type !== 'Block' || !comment.value) continue;

        const jsdocMatch = comment.value.match(/@deprecated\s*(.*?)(?:\n|$)/i);
        if (jsdocMatch) {
          const reason = jsdocMatch[1]?.trim();
          return { reason: reason || undefined };
        }
      }

      return null;
    }

    function getNodeName(node) {
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

    function isAllowedFile(fileName) {
      if (!options.allowedInFiles || options.allowedInFiles.length === 0) {
        return false;
      }
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

    function checkDeprecatedUsage(node, identifierName) {
      if (!options.reportUsage) return;

      const fileName = context.filename;
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

          if (declaration.symbol) {
            const jsDocTags = declaration.symbol.getJsDocTags();
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
      ClassDeclaration(node) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id?.name || 'Unknown';
          deprecatedItems.set(name, { node, reason: deprecated.reason });
          if (options.customMessage) {
            context.report({
              node: node.id || node,
              message: formatCustomMessage(
                options.customMessage,
                name,
                deprecated.reason
              ),
            });
          } else {
            context.report({
              node: node.id || node,
              messageId: 'deprecatedFound',
              data: {
                name,
                reason: deprecated.reason ? `: ${deprecated.reason}` : '',
              },
            });
          }
        }
      },
      MethodDefinition(node) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = getNodeName(node) || 'Unknown';
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
      PropertyDefinition(node) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = getNodeName(node) || 'Unknown';
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
      FunctionDeclaration(node) {
        const deprecated = extractDeprecatedFromJSDoc(node);
        if (deprecated) {
          const name = node.id?.name || 'Unknown';
          deprecatedItems.set(name, { node, reason: deprecated.reason });
          if (options.customMessage) {
            context.report({
              node: node.id || node,
              message: formatCustomMessage(
                options.customMessage,
                name,
                deprecated.reason
              ),
            });
          } else {
            context.report({
              node: node.id || node,
              messageId: 'deprecatedFound',
              data: {
                name,
                reason: deprecated.reason ? `: ${deprecated.reason}` : '',
              },
            });
          }
        }
      },
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier') {
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
        }
      },
      TSInterfaceDeclaration(node) {
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
      TSTypeAliasDeclaration(node) {
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
      Identifier(node) {
        if (options.reportUsage && node.name) {
          checkDeprecatedUsage(node, node.name);
        }
      },
      MemberExpression(node) {
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

