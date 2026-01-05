# AngularSeed

A modern Angular 21 seed project with comprehensive error handling, workspace architecture, and best practices.

## Overview

### Technology Stack

- **Angular 21.0.1** - Latest Angular framework
- **TypeScript 5.9.3** - Strongly typed JavaScript
- **pnpm** - Fast, disk space efficient package manager
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS** - CSS preprocessor
- **Vite** - Fast development server and build tool
- **Vitest** - Modern, fast unit testing framework
- **ESLint** - Code linting and quality enforcement

### Modern Angular Features

- **Zoneless Change Detection** - Performance optimization
- **Standalone Components** - No NgModules, modern architecture
- **Signals** - Reactive state management
- **Signal Forms API** - Type-safe reactive forms
- **Functional Interceptors** - Modern HTTP interceptor pattern

## Architecture

### Workspace Structure

```
angular-seed/
├── seed-app/                    # Main application
├── seed-common-lib/             # Shared common library
└── global-error-handler-lib/    # Error handling library
```

### Project Components

- **seed-app** - Main application with routing, layout, and feature modules
- **seed-common-lib** - Shared components, services, and utilities
- **global-error-handler-lib** - Comprehensive error handling system

## Features

### Global Error Handling

**Purpose:** Centralized error management with user-friendly notifications and detailed error tracking.

**Implementation:**
- Global error handler for Angular errors, promise rejections, and window errors
- HTTP interceptor for HTTP error handling with user-friendly messages
- Signal-based error notification service
- Error history tracking with metadata (route, timestamp, call stack, HTTP status)
- Call stack parsing and filtering
- Mock HTTP service for testing without external dependencies

**Error Types:**
- Angular errors
- HTTP errors (404, 401, 402, 403, 500, network errors)
- Promise rejections
- Async errors
- Timeout errors
- Resource loading errors

**Usage:**
```typescript
import { provideErrorHandling } from 'global-error-handler-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideErrorHandling({
      enableGlobalHandler: true,
      enableHttpInterceptor: true,
      enableNotifications: true,
      production: false
    })
  ]
};
```

### Loading Indicator System

**Purpose:** Reference-counted loading indicator that prevents flickering with concurrent HTTP requests.

**Implementation:**
- Reference counting algorithm for tracking active requests
- Signal-based reactive state management
- Automatic HTTP interceptor integration
- Manual control API for custom scenarios
- Debug logging (`>>>RefCount #N`)

**Algorithm:**
1. Initial: `refCount = 0`, spinner hidden
2. Request starts: `refCount++`, show spinner if `refCount === 1`
3. Request completes: `refCount--`, hide spinner if `refCount === 0`

**Usage:**
```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from 'seed-common-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([loadingInterceptor]))
  ]
};
```

### HTTP Correlation ID Interceptor

**Purpose:** Automatic unique correlation ID headers for request tracking across distributed systems.

**Implementation:**
- UUID generation (with timestamp fallback)
- `X-Correlation-ID` header injection
- Exported constant for header name reuse

**Usage:**
```typescript
import { correlationIdInterceptor } from 'seed-common-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([correlationIdInterceptor]))
  ]
};
```

### Signup/Signin Component

**Purpose:** Modern form component demonstrating Angular v21 Signal Forms API patterns.

**Implementation:**
- Signal Forms API (`form()` function from `@angular/forms/signals`)
- Signal-based form models (writable signals)
- Schema-based validation with path-based validators
- Computed signals for cross-field validation
- Field directive (`[field]`) instead of `formControlName`
- Signal inputs/outputs (`input()`, `output()`)
- Signal-based modal state management

**Example:**
```typescript
readonly signUpModel = signal({
  email: '',
  password: '',
  confirmPassword: '',
});

readonly signUpForm = form(this.signUpModel, (fieldPath) => {
  required(fieldPath.email, { message: 'Email is required' });
  email(fieldPath.email, { message: 'Enter a valid email address' });
  required(fieldPath.password, { message: 'Password is required' });
  minLength(fieldPath.password, 5, {
    message: 'Password must be at least 5 characters',
  });
});
```

### Slide Toggle Component

**Purpose:** Custom form control component demonstrating Angular 21 Signal Forms integration with `FormCheckboxControl` interface.

**Key Technology:** **Signal Forms API** - This component uses the modern Signal Forms approach, eliminating the need for `ControlValueAccessor`.

**Why No ControlValueAccessor?**

In Angular 21's Signal Forms API, custom form controls implement either:
- `FormCheckboxControl` for checkbox/boolean-based controls
- `FormValueControl<T>` for other value-based controls (text, number, select, etc.)

Both interfaces replace `ControlValueAccessor` and provide:

1. **Automatic Integration** - The `Field` directive automatically binds form fields to components implementing `FormCheckboxControl`
2. **Signal-Based State** - Uses `model()` signals for two-way data binding instead of callback functions
3. **Type Safety** - Full TypeScript type checking for form values
4. **Simplified API** - No need to implement `writeValue()`, `registerOnChange()`, `registerOnTouched()`, or `setDisabledState()`
5. **Reactive by Default** - Signal-based reactivity eliminates manual change detection triggers

**Implementation:**
- Implements `FormCheckboxControl` interface from `@angular/forms/signals`
- Uses `checked = model<boolean>(false)` for two-way binding (replaces `ControlValueAccessor`)
- Uses `touched = model<boolean>(false)` for touch state management
- Signal inputs for form state: `disabled`, `readonly`, `hidden`, `invalid`, `errors`, `disabledReasons`
- Signal inputs for component-specific props: `orientation`, `spin`, `knobColor`, etc.
- `ChangeDetectionStrategy.OnPush` for optimal performance
- Standalone component (default in Angular 21)

**Example:**
```typescript
@Component({
  selector: 'lib-slide-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideToggleComponent implements FormCheckboxControl {
  // Required by FormCheckboxControl - replaces ControlValueAccessor
  checked = model<boolean>(false);
  touched = model<boolean>(false);

  // Form state provided by Field directive (read-only)
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  // Component-specific inputs
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  spin = input<boolean>(false);

  onToggle(): void {
    if (this.disabled() || this.readonly()) return;
    this.checked.update(v => !v);
    this.touched.set(true);
  }
}
```

**Usage with Signal Forms:**
```html
<lib-slide-toggle
  [field]="myForm.toggle"
  [orientation]="'horizontal'"
  [spin]="false"
></lib-slide-toggle>
```

The `[field]` binding automatically:
- Syncs the `checked` model with the form field value
- Sets `disabled`, `readonly`, `invalid`, and `errors` inputs based on form state
- Handles validation and error display
- Manages touch state

### Components Test Component

**Purpose:** Interactive testing and demonstration component for the slide-toggle component with full Signal Forms integration.

**Implementation:**
- Signal Forms API with `form()` function
- Signal-based form model (`signal<SlideToggleFormValue>`)
- Field directive binding (`[field]="slideToggleForm.toggle"`)
- Dynamic field state management using `disabled()` function
- Computed signals for reactive form status and values
- Effect-based status updates

**Key Features:**
- Real-time form validation status display
- Interactive test controls for toggle state, orientation, spin, and disabled state
- Form value display with JSON formatting
- Component status tracking (on/off/wait states)

**Example:**
```typescript
@Component({
  selector: 'lib-components-tests',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentsTestsComponent {
  slideToggleModel = signal<SlideToggleFormValue>({
    toggle: false,
    orientation: 'horizontal',
    spin: false,
  });

  isToggleDisabled = signal<boolean>(false);

  // Signal Forms - no ControlValueAccessor needed
  slideToggleForm = form(this.slideToggleModel, (fieldPath) => {
    disabled(fieldPath.toggle, () => this.isToggleDisabled());
  });

  formStatus = computed(() => {
    return this.slideToggleForm().valid() ? 'VALID' : 'INVALID';
  });
}
```

**Signal Forms Benefits:**
- **No ControlValueAccessor** - Direct integration via `FormCheckboxControl` or `FormValueControl<T>`
- **Automatic State Sync** - Field directive handles all form state synchronization
- **Type Safety** - Full TypeScript support for form values and validation
- **Reactive Updates** - Signal-based reactivity ensures UI stays in sync
- **Simplified Code** - Less boilerplate compared to reactive forms with `ControlValueAccessor`

**FormCheckboxControl vs FormValueControl<T>:**

- **`FormCheckboxControl`** - For boolean/checkbox controls:
  ```typescript
  export class MyCheckboxComponent implements FormCheckboxControl {
    checked = model<boolean>(false);
    touched = model<boolean>(false);
    disabled = input<boolean>(false);
    // ... other FormCheckboxControl properties
  }
  ```

- **`FormValueControl<T>`** - For other value-based controls (text, number, select, etc.):
  ```typescript
  export class MyInputComponent implements FormValueControl<string> {
    value = model<string>('');
    touched = model<boolean>(false);
    disabled = input<boolean>(false);
    // ... other FormValueControl properties
  }
  ```

Both interfaces eliminate the need for `ControlValueAccessor` and provide the same benefits: automatic form integration, type safety, and signal-based reactivity.

## Configuration

### TypeScript Configuration

**Purpose:** Strict type safety to prevent type-related bugs and ensure code reliability.

**Key Settings:**

| Setting | Purpose | Rationale |
|---------|---------|-----------|
| `strict: true` | Enables all strict type-checking options | Maximum type safety |
| `noUncheckedIndexedAccess: true` | Requires explicit checks for array/object access | Prevents undefined access errors |
| `noImplicitOverride: true` | Requires explicit `override` keyword | Prevents accidental method overrides |
| `target: "ES2022"` | Compiles to ES2022 JavaScript | Modern language features |
| `module: "preserve"` | Preserves ES module syntax | Better tree-shaking |
| `moduleResolution: "bundler"` | Bundler-aware module resolution | Optimized for modern bundlers |
| `incremental: true` | Enables incremental compilation | Faster build performance |
| `noEmitOnError: true` | Prevents emitting files on compilation errors | Ensures build integrity |
| `baseUrl: "./"` | Sets base directory for module resolution | Simplifies path aliases |
| `strictTemplates: true` | Type-checks Angular templates | Catches template errors at build time |
| `strictInjectionParameters: true` | Requires explicit types for injection parameters | Prevents DI runtime errors |
| `strictInputAccessModifiers: true` | Enforces access modifiers on component inputs | Angular best practices |

### ESLint Configuration

**Purpose:** Code quality enforcement with ESLint 9+ flat config format.

**Why `.mjs` Format:**
1. Modern ESLint 9+ flat config support
2. Native ES module syntax (`import`/`export`)
3. Better IDE support and type checking
4. Programmatic configuration support
5. Future-proof alignment with ESLint direction

**Rules Configuration:**

**Base:**
- `@eslint/js` - Recommended JavaScript rules

**TypeScript:**
- `typescript-eslint/strictTypeChecked` - Strict type-checked rules (includes many type-safety rules automatically)
- `typescript-eslint/stylisticTypeChecked` - Stylistic rules with type information (includes code style rules automatically)

**Note:** The `strictTypeChecked` and `stylisticTypeChecked` configs include many rules automatically. The explicit rules listed below are additional customizations or overrides.

**Base JavaScript Rules:**
- `no-console` - Warns on console statements (allows `console.warn` and `console.error`)
- `no-debugger` - Prevents debugger statements
- `no-alert` - Prevents alert statements
- `no-eval` - Prevents eval usage
- `no-new-func` - Prevents Function constructor usage
- `no-throw-literal` - Requires throwing Error objects
- `no-param-reassign` - Prevents parameter reassignment
- `prefer-const` - Enforces const for variables that are never reassigned
- `no-var` - Prevents var declarations
- `no-await-in-loop` - Warns on await in loops
- `prefer-promise-reject-errors` - Requires Error objects in promise rejections
- `complexity` - Warns on high complexity (max: 15)
- `max-depth` - Warns on deeply nested blocks (max: 4)
- `max-params` - Warns on too many parameters (max: 4)

**Custom TypeScript Rules:**
- `@typescript-eslint/consistent-type-imports` - Enforces `type` keyword for type-only imports (with inline-type-imports fix style)
- `@typescript-eslint/no-floating-promises` - Requires promise handling
- `@typescript-eslint/no-misused-promises` - Prevents incorrect promise usage
- `@typescript-eslint/no-unnecessary-condition` - Flags always-true/false conditions
- `@typescript-eslint/prefer-nullish-coalescing` - Prefers `??` over `\|\|` (with ignoreConditionalTests and ignoreMixedLogicalExpressions)
- `@typescript-eslint/prefer-optional-chain` - Prefers `?.` over verbose null checks
- `@typescript-eslint/no-explicit-any` - Warns on explicit `any` usage (encourages proper typing)
- `@typescript-eslint/use-unknown-in-catch-callback-variable` - Requires `unknown` in catch clauses
- `@typescript-eslint/no-unused-vars` - Catches unused variables (allows `_` prefix, ignores rest siblings)
- `@typescript-eslint/await-thenable` - Prevents awaiting non-promise values
- `@typescript-eslint/no-confusing-void-expression` - Prevents confusing void expressions (with ignoreArrowShorthand)
- `@typescript-eslint/no-unnecessary-type-assertion` - Flags unnecessary type assertions
- `@typescript-eslint/prefer-as-const` - Prefers `as const` for literal types
- `@typescript-eslint/prefer-includes` - Prefers `.includes()` over `.indexOf() !== -1`
- `@typescript-eslint/prefer-string-starts-ends-with` - Prefers `.startsWith()`/`.endsWith()` over regex
- `@typescript-eslint/restrict-plus-operands` - Ensures type-safe addition operations
- `@typescript-eslint/restrict-template-expressions` - Ensures type-safe template expressions
- `@typescript-eslint/unbound-method` - Prevents calling unbound methods
- `@typescript-eslint/no-unnecessary-boolean-literal-compare` - Flags unnecessary boolean comparisons
- `@typescript-eslint/no-meaningless-void-operator` - Prevents meaningless void operators
- `@typescript-eslint/prefer-regexp-exec` - Prefers `RegExp.exec()` over `String.match()`
- `@typescript-eslint/return-await` - Requires return await in try-catch blocks
- `@typescript-eslint/no-misused-new` - Prevents misusing new operator
- `@typescript-eslint/no-this-alias` - Prevents aliasing this
- `@typescript-eslint/no-non-null-assertion` - Warns on non-null assertions
- `@typescript-eslint/require-await` - Requires async functions to use await

**Angular Component/Directive Rules:**
- `@angular-eslint/component-selector` - Enforces `kebab-case` with `app`/`lib` prefix
- `@angular-eslint/directive-selector` - Enforces `camelCase` attribute selectors
- `@angular-eslint/no-empty-lifecycle-method` - Prevents empty lifecycle methods
- `@angular-eslint/use-lifecycle-interface` - Requires implementing lifecycle interfaces
- `@angular-eslint/prefer-standalone` - Encourages standalone components

**Angular Template Rules:**
- `@angular-eslint/template/no-negated-async` - Prevents negated async pipes
- `@angular-eslint/template/use-track-by-function` - Requires trackBy functions in `*ngFor`
- All rules from `@angular-eslint/template/recommended` config

**JavaScript Files Rules:**
- `no-unused-vars` - Warns on unused variables in `.js`, `.jsx`, `.cjs`, `.mjs` files (allows `_` prefix)

**Deprecated Detection Rules:**
- `@typescript-eslint/no-deprecated` - Built-in TypeScript ESLint rule that detects `@deprecated` JSDoc tags (currently disabled to avoid duplicates)
- `custom/detect-deprecated` - Custom rule with enhanced features:
  - Custom error messages with `{{name}}` and `{{reason}}` placeholders
  - File exclusions via `allowedInFiles` option
  - Toggle usage reporting via `reportUsage` option
  - See `tools/eslint-rules/README.md` for full details and comparison

**Disabled Rules:**

Rules are disabled only when necessary, with inline comments explaining why:

| Category | Count | Rule | Reason |
|----------|-------|------|--------|
| Test Framework | 15 | `no-unsafe-assignment`, `no-unsafe-member-access` | Vitest type limitations |
| Error Testing | 2 | `no-unsafe-call`, `no-unsafe-member-access` | Intentional error triggers |
| Runtime Safety | 6 | `no-unnecessary-condition`, `no-base-to-string` | Runtime type checking needed |
| Angular Architecture | 2 | `no-extraneous-class` | Angular DI requirements |

## Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher) - [Install pnpm](https://pnpm.io/installation)

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Run tests
pnpm run test:all

# Lint code
pnpm run lint:all
```

### Build Commands

```bash
# Build all libraries and app
pnpm run build:all

# Build individual libraries
pnpm run build:seed-common-lib
pnpm run build:global-error-handler-lib
```

### Test Commands

```bash
# Run all tests
pnpm run test:all

# Run with coverage
pnpm run test:coverage

# Run with UI
pnpm run test:ui

# Run tests for specific project
pnpm run test:seed-app
pnpm run test:seed-common-lib
pnpm run test:global-error-handler-lib
```

### Lint Commands

```bash
# Lint all projects
pnpm run lint:all

# Lint individual projects
pnpm run lint:seed-app
pnpm run lint:seed-common-lib
pnpm run lint:global-error-handler-lib
```

## Guidelines

### Angular Best Practices

When creating new components, services, pipes, or directives:

1. **Standalone Components** - No NgModules, use direct imports (default in Angular 21)
2. **OnPush Change Detection** - Always use `ChangeDetectionStrategy.OnPush`
3. **Modern Control Flow** - Use `@if`, `@for`, `@switch` instead of structural directives
4. **Zoneless Change Detection** - App uses `provideZonelessChangeDetection()`
5. **Signals over RxJS** - Prefer Angular signals for state management
6. **Signal Inputs/Outputs** - Use `input()` and `output()` instead of decorators
7. **Signal Forms API** - Use Signal Forms (`form()`, `Field` directive) for new forms
8. **FormCheckboxControl/FormValueControl for Custom Controls** - Implement `FormCheckboxControl` (for boolean/checkbox) or `FormValueControl<T>` (for other values) instead of `ControlValueAccessor` for custom form controls
9. **Functional Interceptors** - Use functional HTTP interceptors

### Code Quality Standards

- All components use `ChangeDetectionStrategy.OnPush`
- All state management uses Angular signals
- All new forms use Signal Forms API (`form()`, `Field` directive)
- Custom form controls implement `FormCheckboxControl` (for boolean/checkbox) or `FormValueControl<T>` (for other values) - no `ControlValueAccessor` needed
- All HTTP interceptors are functional
- All ESLint rules are followed (with documented exceptions)
- All TypeScript strict mode rules are enabled

## Reference

### Signal Forms Locations

Signal Forms are marked with `// SignalForm` comments throughout the codebase. Here are the locations:

**Form Definitions (TypeScript):**
- `projects/seed-common-lib/src/lib/components-tests/components-tests.component.ts` - `slideToggleForm` (line 40)
- `projects/seed-common-lib/src/lib/signup-signin/signup-signin.component.ts` - `signUpForm` (line 38), `signInForm` (line 63)

**Field Bindings (Templates):**
- `projects/seed-common-lib/src/lib/components-tests/components-tests.component.html` - `[field]="slideToggleForm.toggle"` (line 29)
- `projects/seed-common-lib/src/lib/signup-signin/signup-signin.component.html` - Multiple `[field]` bindings:
  - `[field]="signUpForm.email"` (line 22)
  - `[field]="signUpForm.password"` (line 37)
  - `[field]="signUpForm.confirmPassword"` (line 53)
  - `[field]="signInForm.email"` (line 112)
  - `[field]="signInForm.password"` (line 127)

**FormCheckboxControl Implementation:**
- `projects/seed-common-lib/src/lib/slide-toggle/slide-toggle.component.ts` - `SlideToggleComponent` implements `FormCheckboxControl` (line 10)

### Keyboard Shortcuts

- **Ctrl+Shift+E** / **Cmd+Shift+E** - Open error testing modal
- **Ctrl+Shift+W** / **Cmd+Shift+W** - Open loading spinner test modal
- **Ctrl+Shift+U** / **Cmd+Shift+U** - Open signup modal
- **Ctrl+Shift+I** / **Cmd+Shift+I** - Open signin modal
- **Ctrl+Shift+C** / **Cmd+Shift+C** - Open components test component to show slide toggle component to demonstrate how it work

### Resources

- [Angular CLI Overview](https://angular.dev/tools/cli)
- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Angular Standalone Components](https://angular.dev/guide/components/importing)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
