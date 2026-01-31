# Custom ESLint Rules

This directory contains custom ESLint rules for the Angular seed project:

- **`detect-deprecated`** - Detects `@deprecated` JSDoc and usage of deprecated items
- **`detect-type-assertion`** - Warns on TypeScript type assertion (casting) usage

## Deprecated Detection Rules

This project uses two complementary rules for detecting deprecated code:

1. **`@typescript-eslint/no-deprecated`** - Built-in TypeScript ESLint rule
2. **`custom/detect-deprecated`** - Custom rule with enhanced features

### Rule Comparison

| Feature | `@typescript-eslint/no-deprecated` | `custom/detect-deprecated` |
|---------|-----------------------------------|---------------------------|
| **Source** | Built-in (typescript-eslint) | Custom implementation |
| **Maintenance** | Community maintained | Project maintained |
| **Custom Messages** | No | Yes (with `{{name}}` and `{{reason}}` placeholders) |
| **File Exclusions** | No | Yes (`allowedInFiles` option) |
| **Usage Reporting Toggle** | Always on | Configurable (`reportUsage` option) |
| **Severity Control** | Yes | Yes |
| **TypeScript Integration** | Full | Full |
| **Performance** | Optimized | Good |

### Recommendation

**Use `custom/detect-deprecated`** if you need:
- Custom error messages (e.g., `⚠️ {{name}} is deprecated{{reason}}. Please migrate to the new API.`)
- File exclusions (e.g., allow deprecated items in test files)
- Toggle usage reporting on/off

**Use `@typescript-eslint/no-deprecated`** if you:
- Prefer standard, well-tested behavior
- Don't need customization
- Want minimal maintenance overhead

**Current Setup:** The project uses `custom/detect-deprecated` with the built-in rule disabled to avoid duplicate warnings. See `eslint.config.mjs` for configuration.

## detect-type-assertion

A custom rule that warns on TypeScript type assertion (casting) usage.

### Features

- Detects `value as Type` (TSAsExpression) and `<Type>value` (TSTypeAssertion)
- Reports the asserted type in the message
- Configurable file exclusions via `allowedInFiles`
- Optional custom message with `{{typeText}}` placeholder

### Configuration

```javascript
'custom/detect-type-assertion': [
  'warn',
  {
    allowedInFiles: ['**/tools/eslint-rules/**'],
    customMessage: undefined
  }
]
```

- **`allowedInFiles`** (string[]): File patterns where type assertions are allowed (no report). Supports wildcards.
- **`customMessage`** (string): Custom message. Use `{{typeText}}` for the asserted type text.

### Lint script

To list type assertion usage across all `.ts` files:

```bash
pnpm run lint:type-assertions
```

To see only type-assertion warnings in the output:

```bash
pnpm run lint:type-assertions 2>&1 | grep -B1 "custom/detect-type-assertion"
```

### Implementation

- **`detect-type-assertion.ts`** - TypeScript implementation (TSESTree)
- **`detect-type-assertion.mjs`** - JavaScript version used by ESLint config

The rule visits `TSAsExpression` and `TSTypeAssertion` nodes and reports with message: *"Type assertion (cast) used: '…'. Prefer type-safe alternatives where possible."*

### Using Both Rules Together

If you want to use both rules simultaneously (not recommended due to duplicate warnings), you can configure them differently:

```javascript
rules: {
  // Built-in rule: Only report declarations (usage reporting is always on)
  '@typescript-eslint/no-deprecated': 'warn',
  
  // Custom rule: Only report usages (declarations already covered by built-in)
  'custom/detect-deprecated': [
    'warn',
    {
      reportUsage: true,
      allowedInFiles: ['**/*.spec.ts'],  // Allow deprecated in tests
      customMessage: '⚠️ {{name}} is deprecated{{reason}}. Please migrate.',
    },
  ],
}
```

**Note:** This will result in duplicate warnings for declarations. It's recommended to use only one rule.

## detect-deprecated

A TypeScript AST custom rule that detects Angular items marked with the `@deprecated` JSDoc tag.

### Features

- Detects `@deprecated` JSDoc tags on:
  - Classes
  - Methods
  - Properties
  - Functions
  - Variables
  - Interfaces
  - Type aliases

- Reports usage of deprecated items (optional)
- Configurable file exclusions

### Implementation

The rule is implemented in two versions:
- **`detect-deprecated.mjs`**: JavaScript version (used by ESLint config)
- **`detect-deprecated.ts`**: TypeScript version (reference implementation with types)

The JavaScript version (`.mjs`) is used because ESLint flat config requires ES modules and cannot directly import TypeScript files. The TypeScript version serves as a reference implementation with full type safety.

**Plugin Structure:**

Both custom rules are registered in `eslint.config.mjs`:

```javascript
const customPlugin = {
  rules: {
    'detect-deprecated': detectDeprecatedRule,
    'detect-type-assertion': detectTypeAssertionRule,
  },
};

// In plugins configuration:
plugins: {
  '@angular-eslint': angular,
  'custom': customPlugin,
}
```

This structure follows ESLint flat config requirements where plugins must have a `rules` property containing rule definitions.

### How It Works

The rule uses TypeScript's AST and type checker to:

1. **Parse JSDoc Comments**: Extracts `@deprecated` tags from JSDoc comments before declarations
2. **Traverse AST Nodes**: Visits relevant AST nodes (classes, methods, properties, functions, variables, interfaces, type aliases)
3. **Type Checking**: Uses TypeScript's `getTypeChecker()` to identify deprecated symbols when they're used
4. **Report Issues**: Reports both deprecated declarations and their usage (if enabled)

**AST Node Visitors:**

The rule listens to the following AST node types:
- `ClassDeclaration` - Detects deprecated classes
- `MethodDefinition` - Detects deprecated methods
- `PropertyDefinition` - Detects deprecated properties
- `FunctionDeclaration` - Detects deprecated functions
- `VariableDeclarator` - Detects deprecated variables
- `TSInterfaceDeclaration` - Detects deprecated interfaces
- `TSTypeAliasDeclaration` - Detects deprecated type aliases
- `Identifier` - Detects usage of deprecated identifiers
- `MemberExpression` - Detects usage of deprecated member expressions

### Setup

The rule is already integrated into `eslint.config.mjs`. No additional setup is required.

**File Coverage:**

The rule covers all TypeScript files from the workspace root using wildcard patterns (`**/*.ts`) configured in `angular.json`. This includes:
- All files in `projects/` directory (apps and libraries)
- Root-level files like `vitest.setup.ts`, `vitest.config.ts`, etc.
- Files in `tools/` directory

ESLint's ignore patterns automatically exclude:
- `**/dist/**` - Build outputs
- `**/node_modules/**` - Dependencies
- `**/*.config.*` - Config files (optional, can be customized)

### Configuration

The rule accepts the following options:

```javascript
{
  reportUsage: true,        // Report when deprecated items are used (default: true)
  allowedInFiles: [],       // File patterns where deprecated items are allowed (default: [])
  customMessage: undefined  // Custom message template with {{name}} and {{reason}} placeholders (optional)
}
```

**Option Details:**

- **`reportUsage`** (boolean): When `true`, reports both deprecated declarations and their usage. When `false`, only reports declarations.
- **`allowedInFiles`** (string[]): Array of file patterns where deprecated items are allowed. Supports wildcards (e.g., `['**/*.spec.ts']`).
- **`customMessage`** (string): Custom message template. Use `{{name}}` for the deprecated item name and `{{reason}}` for the JSDoc reason text.

### Example Usage

```typescript
/**
 * @deprecated Use NewComponent instead
 */
export class OldComponent {
  // ...
}

// This will trigger a warning if reportUsage is enabled
const instance = new OldComponent();
```

### Rule Behavior

**Declaration Detection:**

When a declaration (class, method, property, etc.) has a `@deprecated` JSDoc tag, the rule immediately reports it:

```typescript
/**
 * @deprecated Use NewService instead
 */
export class OldService {
  // Rule reports: 'OldService' is marked as @deprecated: Use NewService instead
}
```

**Usage Detection:**

When `reportUsage: true` (default), the rule also detects when deprecated items are used:

```typescript
// If OldService is deprecated, this usage triggers a warning:
const service = new OldService();
// Rule reports: Usage of deprecated 'OldService' found. Consider using an alternative.
```

**JSDoc Parsing:**

The rule extracts both the `@deprecated` tag and optional reason text:

```typescript
/**
 * @deprecated This method is deprecated: use newMethod() instead
 */
oldMethod() { }
// Rule reports: 'oldMethod' is marked as @deprecated: This method is deprecated: use newMethod() instead
```

### Implementation Details

**TypeScript Integration:**

The rule leverages TypeScript's compiler API:
- `getTypeChecker()` - Accesses TypeScript's type information to resolve symbols
- `parserServices.esTreeNodeToTSNodeMap` - Maps ESLint AST nodes to TypeScript AST nodes
- `parserServices.tsNodeToESTreeNodeMap` - Maps TypeScript AST nodes back to ESLint AST nodes
- `getSymbolAtLocation()` - Gets the symbol for an identifier to check if it's deprecated
- `getJsDocTags()` - Retrieves JSDoc tags from TypeScript symbols

**JSDoc Parsing:**

The rule parses JSDoc comments using regex to extract:
- `@deprecated` tag presence
- Optional reason text after the tag

**Error Handling:**

The rule gracefully handles cases where:
- TypeScript parser services are not available (returns empty visitor object)
- Type checking fails (catches errors silently)
- Symbols cannot be resolved (skips usage detection)

### Testing

An example file is provided at `tools/eslint-rules/example-deprecated.ts` demonstrating various deprecated patterns:

```typescript
/**
 * @deprecated Use NewService instead
 */
export class OldService {
  /**
   * @deprecated This method is deprecated
   */
  oldMethod(): void {
    console.log('old');
  }
}

/**
 * @deprecated Use newFunction instead
 */
export function oldFunction(): string {
  return 'old';
}
```

Run ESLint to see the rule in action:
```bash
pnpm run lint:all
```

The rule will report:
- Deprecated declarations (classes, methods, functions, etc.)
- Usage of deprecated items (when `reportUsage: true`)

### Configuration Options

The rule accepts the following options:

```javascript
{
  reportUsage: true,        // Report when deprecated items are used (default: true)
  allowedInFiles: [],       // File patterns where deprecated items are allowed (default: [])
  customMessage: undefined  // Custom message template with {{name}} and {{reason}} placeholders (optional)
}
```

**Option Details:**

- **`reportUsage`** (boolean): When `true`, reports both deprecated declarations and their usage. When `false`, only reports declarations.
- **`allowedInFiles`** (string[]): Array of file patterns where deprecated items are allowed. Supports wildcards (e.g., `['**/*.spec.ts']`).
- **`customMessage`** (string): Custom message template. Use `{{name}}` for the deprecated item name and `{{reason}}` for the JSDoc reason text.

### Current Configuration

The rule is configured in `eslint.config.mjs` with:

```javascript
'@typescript-eslint/no-deprecated': 'off',  // Disabled to avoid duplicate warnings
'custom/detect-deprecated': [
  'warn',
  {
    reportUsage: true,
    allowedInFiles: [],
    customMessage: '⚠️ {{name}} is deprecated{{reason}}. Please migrate to the new API.',
  },
]
```

This means:
- **Warning level**: Deprecated items trigger warnings (not errors)
- **Usage reporting**: Enabled - both declarations and usages are reported
- **File exclusions**: None - all files are checked
- **Custom message**: Uses a custom message template with emoji and placeholders
- **Built-in rule**: Disabled to prevent duplicate warnings

