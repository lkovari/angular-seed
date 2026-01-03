// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import prettier from 'eslint-config-prettier';

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
    },
    rules: {
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
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',

      // This is the rule that flagged your main.ts (you can keep it on)
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
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
   * Prettier (must be last)
   * ===================================================== */
  prettier,
];