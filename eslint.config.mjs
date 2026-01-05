// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import prettier from 'eslint-config-prettier';
import detectDeprecatedRuleModule from './tools/eslint-rules/detect-deprecated.mjs';

const detectDeprecatedRule = detectDeprecatedRuleModule.default || detectDeprecatedRuleModule;

const customPlugin = {
  rules: {
    'detect-deprecated': detectDeprecatedRule,
  },
};

export default [
  /* =====================================================
   * Global ignores
   * ===================================================== */
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',

      // tooling output / cache
      '**/.angular/**',
      '**/.eslintcache',
      '**/*.config.*',
    ],
  },

  /* =====================================================
   * Base JS rules
   * ===================================================== */
  js.configs.recommended,

  /* =====================================================
   * TypeScript rules (applied only to .ts files)
   * ===================================================== */
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),

  /* =====================================================
   * TypeScript (workspace)
   * ===================================================== */
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // typescript-eslint v8 recommendation for multi-tsconfig workspaces
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@angular-eslint': angular,
      'custom': customPlugin,
    },
    rules: {
      /* Base JavaScript rules */
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-throw-literal': 'error',
      'no-param-reassign': ['error', { props: true }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-await-in-loop': 'warn',
      'prefer-promise-reject-errors': 'error',
      'complexity': ['warn', { max: 15 }],
      'max-depth': ['warn', { max: 4 }],
      'max-params': ['warn', { max: 4 }],

      /* Angular specific */
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', style: 'kebab-case', prefix: ['app', 'lib'] },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', style: 'camelCase' },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-standalone': 'error',

      /* TS best practices */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignoreConditionalTests: true, ignoreMixedLogicalExpressions: true },
      ],
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/require-await': 'error',

      // Disable built-in deprecated rule (using custom instead)
      '@typescript-eslint/no-deprecated': 'off',
      
      /* Custom rules */
      'custom/detect-deprecated': [
        'warn',
        {
          reportUsage: true,
          allowedInFiles: [],
          customMessage: '⚠️ {{name}} is deprecated{{reason}}. Please migrate to the new API.',
        },
      ],
    },
  },

  /* =====================================================
   * Angular templates (HTML)
   * ===================================================== */
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,

      /* Template best practices */
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/use-track-by-function': 'error',
    },
  },

  /* =====================================================
   * JavaScript files
   * ===================================================== */
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  /* =====================================================
   * Prettier (must be last)
   * ===================================================== */
  prettier,
];