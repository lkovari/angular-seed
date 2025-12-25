# AngularSeed

A modern Angular 21 seed project with comprehensive error handling, workspace architecture, and best practices.

## Technology Stack

- **Angular 21.0.1** - Latest Angular framework
- **TypeScript 5.9.3** - Strongly typed JavaScript
- **pnpm** - Fast, disk space efficient package manager
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS** - CSS preprocessor
- **Zoneless Change Detection** - Modern Angular performance optimization
- **Standalone Components** - No NgModules, modern Angular architecture
- **Signals** - Reactive state management
- **Vite** - Fast development server and build tool
- **Vitest** - Modern, fast unit testing framework (replaced Karma/Jasmine)
- **ESLint** - Code linting and quality enforcement

## Project Structure

### Workspace Architecture
- **seed-app** - Main application
- **seed-common-lib** - Shared common library
- **global-error-handler-lib** - Comprehensive error handling library

## Key Features

### Global Error Handling (`global-error-handler-lib`)
- Comprehensive error catching:
  - Angular errors
  - HTTP errors (404, 401, 402, 403, 500, etc.)
  - Promise rejections
  - Async errors
  - Timeout errors
  - Resource loading errors
- HTTP interceptor with configurable retry logic
- User-friendly error notifications with auto-dismiss
- Call stack tracking and parsing
- Error history with detailed metadata
- Route and HTTP status tracking
- Error indicator in header (orange warning triangle)
- Error testing modal (press **Ctrl+Shift+E** or **Cmd+Shift+E**)
- 18 different error scenarios for testing

### Loading Indicator System (`seed-common-lib`)
- Reference counting for multiple concurrent HTTP requests
- Signal-based reactive state management
- Automatic HTTP interceptor integration
- Manual control when needed
- Customizable loading adapters
- Testing modal (press **Ctrl+Shift+W** or **Cmd+Shift+W**)
- Console logging for debugging reference counts

### Seed App Features
- CSS Grid layout
- Separated and parametrized components (header, sidebar, footer)
- Dynamic side menu generation from JSON descriptor
- HTTP correlation ID interceptor for request tracking
- Responsive design with mobile support

### Modern Angular Practices
- **Standalone components** - No NgModules
- **OnPush change detection** - Optimized performance
- **Control flow syntax** - `@if`, `@for` instead of `*ngIf`, `*ngFor`
- **Zoneless change detection** - `provideZonelessChangeDetection()`
- **Signals** - Modern reactive state management
- **Functional interceptors** - Modern HTTP interceptor pattern
- **Signal inputs/outputs** - Modern `input()` and `output()` API
- **Typed reactive forms** - Fully type-safe form groups and controls

## Angular Version

Originally generated with Angular CLI 19.0.6, upgraded to **Angular 21.0.1**

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (v8 or higher) - [Install pnpm](https://pnpm.io/installation)

> **Note:** This project uses **pnpm** as the package manager for better performance and disk space efficiency. If you're migrating from npm, make sure to remove `package-lock.json` and `node_modules` before running `pnpm install`.

### Installation

```bash
pnpm install
```

### Start the Project Locally

To start a local development server, run:

```bash
pnpm start
```

Or using Angular CLI directly:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Error Testing

Press **Ctrl+Shift+E** (Windows/Linux) or **Cmd+Shift+E** (Mac) to open the error testing modal. This allows you to test 18 different error scenarios including:
- JavaScript errors (TypeError, ReferenceError, etc.)
- HTTP errors (404, 401, 402, 403, 500, etc.)
- Async and Promise errors
- Network errors
- Custom notifications

When errors occur, an orange warning indicator appears in the header showing the error count. Click it to view the error history with full details including call stacks, routes, and HTTP status codes.

### Loading Spinner Testing

Press **Ctrl+Shift+W** (Windows/Linux) or **Cmd+Shift+W** (Mac) to open the loading spinner test modal. This allows you to test:
- **HTTP Interceptor Test**: Simulates a 4-second HTTP call with automatic spinner
- **Manual Control Test**: Manually shows/hides spinner for 3 seconds
- **Multiple Concurrent Calls**: Tests reference counting with 3 concurrent HTTP calls (2s, 3s, 4s)

Open the browser console to see detailed reference count logs (`>>>RefCount #N`) showing how the system tracks multiple concurrent operations.

## Code Quality

### Linting

This project uses ESLint for code quality and consistency. All lint errors have been fixed and the codebase follows strict TypeScript and Angular best practices.

#### Run Linting

To lint all projects:

```bash
pnpm run lint:all
```

To lint individual projects:

```bash
pnpm run lint:seed-app
pnpm run lint:seed-common-lib
pnpm run lint:global-error-handler-lib
```

#### Code Formatting

The project uses Prettier for consistent code formatting. To format all files:

```bash
pnpm run format
```

#### Lint Status

All lint errors have been fixed. The codebase now uses:
- Strict TypeScript types (`unknown` instead of `any` where appropriate)
- Proper type guards for safe property access
- Angular style guide compliance (output naming, lifecycle hooks)
- No unused imports or variables
- Consistent code formatting

### Type Safety Improvements

The codebase has been refactored for better type safety:
- Replaced `any` types with `unknown` in error handling
- Added type guards for safe property access
- Improved type safety in error handlers and interceptors
- All type errors resolved

## TypeScript Configuration

The project uses strict TypeScript compiler options to ensure type safety and code quality. Below is a detailed explanation of the key `tsconfig.json` settings:

### Global Strictness & Safety

| Rule | Description | Purpose | Why Needed |
|------|-------------|---------|------------|
| `strict: true` | Enables all strict type-checking options | Enforces maximum type safety by enabling multiple strict checks simultaneously | Prevents common type-related bugs and ensures code reliability |
| `noUncheckedIndexedAccess: true` | Requires explicit checks for array/object index access | Makes array and object property access safer by requiring null/undefined checks | Prevents runtime errors from accessing undefined array elements or object properties |
| `noImplicitOverride: true` | Requires explicit `override` keyword when overriding methods | Ensures intentional method overriding and prevents accidental overrides | Prevents bugs from accidentally overriding parent class methods without awareness |
| `noPropertyAccessFromIndexSignature: true` | Disallows property access on index signature types | Forces explicit bracket notation for index signatures | Prevents confusion between regular properties and index signature properties |
| `noImplicitReturns: true` | Ensures all code paths return a value | Requires explicit return statements in all code paths | Prevents functions from returning undefined when a return value is expected |
| `noFallthroughCasesInSwitch: true` | Prevents fallthrough in switch statements | Requires explicit `break` or `return` in switch cases | Prevents bugs from accidentally falling through to the next case |
| `forceConsistentCasingInFileNames: true` | Enforces consistent file name casing | Ensures file imports work correctly across different operating systems | Prevents import errors on case-sensitive file systems (Linux) |

### Modern JS/TS Targets

| Rule | Description | Purpose | Why Needed |
|------|-------------|---------|------------|
| `target: "ES2022"` | Compiles to ES2022 JavaScript | Uses modern JavaScript features while maintaining compatibility | Enables modern language features while supporting current browsers |
| `module: "preserve"` | Preserves import/export syntax | Keeps ES module syntax for modern bundlers | Allows bundlers to optimize module resolution and tree-shaking |
| `moduleResolution: "bundler"` | Uses bundler-aware module resolution | Optimized for modern bundlers (Vite, Webpack, etc.) | Provides better module resolution for modern build tools |
| `useDefineForClassFields: false` | Uses old class field initialization | Required for Angular decorators to work correctly | Angular's decorator system relies on the old class field behavior |
| `isolatedModules: true` | Ensures each file can be transpiled independently | Required for fast builds and type-checking | Enables faster incremental builds and better tooling support |
| `verbatimModuleSyntax: true` | Preserves import/export syntax exactly | Enforces explicit type-only imports | Prevents accidental runtime imports of type-only modules, improving bundle size |

### Angular & Decorators

| Rule | Description | Purpose | Why Needed |
|------|-------------|---------|------------|
| `experimentalDecorators: true` | Enables decorator support | Required for Angular decorators (@Component, @Injectable, etc.) | Angular framework relies on decorators for metadata and dependency injection |

### Source & Helpers

| Rule | Description | Purpose | Why Needed |
|------|-------------|---------|------------|
| `sourceMap: true` | Generates source maps for debugging | Enables debugging of original TypeScript code in browser dev tools | Essential for development debugging experience |
| `importHelpers: true` | Imports helper functions from tslib | Reduces bundle size by reusing helper functions | Prevents code duplication and reduces final bundle size |

### Module Resolution

| Rule | Description | Purpose | Why Needed |
|------|-------------|---------|------------|
| `resolveJsonModule: true` | Allows importing JSON files | Enables importing JSON configuration files | Useful for configuration files, translations, and static data |
| `esModuleInterop: true` | Enables interoperability between CommonJS and ES modules | Allows importing CommonJS modules in ES module syntax | Ensures compatibility with npm packages that use CommonJS |

### Angular Compiler Options

| Rule | Description | Purpose | Why Needed |
|------|-------------|---------|------------|
| `strictInjectionParameters: true` | Requires explicit types for injection parameters | Ensures dependency injection parameters are properly typed | Prevents runtime errors from missing or incorrect dependency injection |
| `strictInputAccessModifiers: true` | Enforces access modifiers on component inputs | Ensures component inputs follow Angular best practices | Prevents accidental public exposure of internal component state |
| `strictTemplates: true` | Enables strict template type checking | Type-checks Angular templates at compile time | Catches template errors at build time instead of runtime |

## ESLint Configuration

The project uses ESLint with strict rules to enforce code quality, consistency, and prevent common bugs. Below is a detailed explanation of the key rules in `.eslintrc.json`:

### TypeScript-Specific Rules

| Rule | What It Prevents |
|------|------------------|
| `@typescript-eslint/no-unused-vars` | Unused variables, parameters, and imports (allows `_` prefix for intentionally unused) |
| `@typescript-eslint/no-explicit-any` | Use of `any` type (warns to encourage proper typing) |
| `@typescript-eslint/no-floating-promises` | Unhandled promises that could cause uncaught rejections |
| `@typescript-eslint/no-misused-promises` | Promises used incorrectly (e.g., in conditionals without await) |
| `@typescript-eslint/await-thenable` | Using `await` on non-Promise values |
| `@typescript-eslint/prefer-nullish-coalescing` | Using `\|\|` instead of `??` for null/undefined checks |
| `@typescript-eslint/prefer-optional-chain` | Verbose null checks instead of optional chaining (`?.`) |
| `@typescript-eslint/no-unnecessary-boolean-literal-compare` | Redundant boolean comparisons (e.g., `if (x === true)`) |
| `@typescript-eslint/no-unnecessary-condition` | Conditions that are always true/false |
| `@typescript-eslint/consistent-type-imports` | Mixing type and value imports (enforces `type` keyword for type-only imports) |
| `@typescript-eslint/no-confusing-void-expression` | Confusing void expressions in return statements |
| `@typescript-eslint/no-meaningless-void-operator` | Unnecessary `void` operators |
| `@typescript-eslint/prefer-regexp-exec` | Using `String.match()` instead of `RegExp.exec()` |
| `@typescript-eslint/return-await` | Missing `await` in try-catch blocks (requires await in error handling) |
| `@typescript-eslint/no-misused-new` | Using `new` incorrectly |
| `@typescript-eslint/no-this-alias` | Assigning `this` to variables (can cause context issues) |
| `@typescript-eslint/no-unnecessary-type-assertion` | Unnecessary type assertions that don't change types |
| `@typescript-eslint/no-non-null-assertion` | Use of non-null assertion operator (`!`) |
| `@typescript-eslint/prefer-as-const` | Using `as const` instead of type assertions for literal types |
| `@typescript-eslint/require-await` | Async functions without await statements |

### General JavaScript/TypeScript Rules

| Rule | What It Prevents |
|------|------------------|
| `no-console` | `console.log()` statements (allows `console.warn()` and `console.error()`) |
| `no-debugger` | `debugger` statements in production code |
| `no-alert` | `alert()`, `confirm()`, `prompt()` calls |
| `no-eval` | `eval()` usage (security risk) |
| `no-new-func` | `new Function()` constructor (security risk) |
| `no-throw-literal` | Throwing non-Error objects |
| `no-param-reassign` | Reassigning function parameters (allows property modification) |
| `prefer-const` | Using `let` when `const` would suffice |
| `no-var` | Using `var` instead of `let`/`const` |
| `no-await-in-loop` | Using `await` inside loops (performance issue) |
| `prefer-promise-reject-errors` | Rejecting promises with non-Error values |

### Code Complexity Rules

| Rule | What It Prevents |
|------|------------------|
| `complexity` | Functions with cyclomatic complexity > 15 (warns) |
| `max-depth` | Nested code blocks deeper than 4 levels (warns) |
| `max-params` | Functions with more than 4 parameters (warns) |

### Ignore Patterns

The following patterns are ignored by ESLint:
- `projects/**/*` - Project-specific files (handled by project-specific configs)
- `**/dist` - Build output directories
- `**/.angular` - Angular cache directories
- `**/vite.config.*.timestamp*` - Vite timestamp files
- `**/vitest.config.*.timestamp*` - Vitest timestamp files
- `**/*.config.{ts,mts,cts}` - Configuration files
- `**/eslint.config.{js,mjs,cjs,ts,mts,cts}` - ESLint config files

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

### Build for Production

To build the entire project (libraries and application) for production, run:

```bash
pnpm run gitbuild
```

This command will:
1. Build all libraries (`seed-common-lib` and `global-error-handler-lib`) with production configuration
2. Build the application with production optimizations, AOT compilation, and tree-shaking
3. Output to `dist/` directory with optimized bundles

The build artifacts will be stored in the `dist/` directory:
- `dist/seed-common-lib/` - Common library package
- `dist/global-error-handler-lib/` - Error handler library package
- `dist/` - Application build (browser-ready files)

### Build Individual Parts

To build only the libraries:

```bash
pnpm run build-libs
```

This builds both `seed-common-lib` and `global-error-handler-lib` in production mode.

To build only the application:

```bash
pnpm run build-app
```

This builds the seed-app with production optimizations and AOT compilation.

To build individual libraries:

```bash
# Build seed-common-lib in production mode
pnpm run build:seed-common-lib

# Build global-error-handler-lib in production mode
pnpm run build:global-error-handler-lib

# Build libraries in development mode
pnpm run build:seed-common-lib:dev
pnpm run build:global-error-handler-lib:dev
```

To build the project for development:

```bash
ng build
```

### Build Configuration

- **Production builds** include:
  - AOT (Ahead-of-Time) compilation
  - Tree-shaking and dead code elimination
  - Minification and optimization
  - Output hashing for cache busting
  - Source maps disabled for smaller bundle size

- **Development builds** include:
  - JIT (Just-in-Time) compilation
  - Source maps enabled
  - No optimization for faster builds
  - Better debugging experience

## Running Tests

This project uses [Vitest](https://vitest.dev/) for modern, fast unit testing. Vitest provides:
- **Fast execution** - Runs tests in parallel with minimal overhead
- **Modern ESM support** - Native ES modules support
- **Great DX** - Built-in watch mode, coverage, and UI
- **TypeScript first** - Zero-config TypeScript support

### Run All Tests

To execute all unit tests across all projects:

```bash
pnpm test
```

Or use the explicit alias:

```bash
pnpm run test:all
```

Both commands run all tests in the workspace. Or run tests in watch mode (automatically re-runs on file changes):

```bash
pnpm run test:watch
```

### Run Tests with UI

For an interactive test interface:

```bash
pnpm run test:ui
```

### Run Tests with Coverage

To generate code coverage reports with output saved to a text file:

```bash
pnpm run test:coverage
```

This command will:
- Run all tests with coverage enabled
- Generate coverage reports in multiple formats (HTML, JSON, text)
- Save a detailed text report to `coverage/coverage-report.txt`
- Display coverage summary in the console

The coverage report includes:
- Coverage summary (lines, statements, functions, branches)
- Detailed file-by-file coverage information
- Coverage thresholds and status

Coverage reports are generated in the `coverage/` directory:
- `coverage/coverage-report.txt` - Human-readable text report
- `coverage/index.html` - Interactive HTML report
- `coverage/coverage-summary.json` - JSON summary for CI/CD integration

### Run Tests for Specific Projects

To run tests for a specific project:

```bash
pnpm run test:seed-app
pnpm run test:seed-common-lib
pnpm run test:global-error-handler-lib
```

### Test Status

All tests are passing and have been fixed to work with Vitest. The migration from Karma/Jasmine to Vitest is complete.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Project Configuration

### Angular Configuration Rules

When creating new components, services, pipes, or directives in this project:

1. **Use standalone components** - No NgModules
2. **OnPush change detection** - Always use `ChangeDetectionStrategy.OnPush`
3. **Modern control flow** - Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`
4. **Zoneless change detection** - The app uses `provideZonelessChangeDetection()`
5. **Signals over RxJS** - Prefer Angular signals for state management
6. **Signal inputs/outputs** - Use `input()` and `output()` instead of `@Input()` and `@Output()`
7. **Typed reactive forms** - Use typed `FormGroup` and `FormControl` for type safety
8. **Functional interceptors** - Use functional HTTP interceptors instead of class-based

### Libraries

#### global-error-handler-lib

Comprehensive error handling library that can be reused across projects.

**Features:**
- Global error handler for Angular errors
- HTTP interceptor with retry logic
- Error notification service with signals
- Error history tracking
- Call stack parsing and filtering
- Route and HTTP status tracking
- Testing component with 18 error scenarios

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

#### seed-common-lib

Shared common library for reusable components and utilities.

**Features:**
- Loading indicator system with reference counting
- HTTP interceptor for automatic loading state
- HTTP correlation ID interceptor for request tracking
- Angular version display component
- Signup/Signin component with typed forms and modal dialogs
- Wait spinner test component for testing loading scenarios
- Signal-based reactive state management
- Customizable loading adapters

**Usage:**
```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { 
  loadingInterceptor, 
  correlationIdInterceptor,
  LoadingSpinnerComponent,
  AngularVersionComponent,
  WaitSpinnerTestComponent,
  SignupSigninComponent
} from 'seed-common-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([
      correlationIdInterceptor,
      loadingInterceptor
    ]))
  ]
};

@Component({
  imports: [
    LoadingSpinnerComponent, 
    AngularVersionComponent,
    WaitSpinnerTestComponent,
    SignupSigninComponent
  ],
  template: `
    <lib-loading-spinner />
    <lib-angular-version />
    <lib-wait-spinner-test />
    <lib-signup-signin />
  `
})
export class AppComponent {}
```

**Angular Version Component:**

The Angular version component displays the current Angular version. It's located in `projects/seed-common-lib/src/lib/angular-version/` and can be imported from `seed-common-lib`.

```typescript
import { AngularVersionComponent } from 'seed-common-lib';

@Component({
  imports: [AngularVersionComponent],
  template: `<lib-angular-version />`
})
export class MyComponent {}
```

**Correlation ID Interceptor:**

The correlation ID interceptor automatically adds a unique `X-Correlation-ID` header to all HTTP requests, enabling backend request tracking and debugging. Each request receives a unique correlation ID (UUID when available, fallback to timestamp-based ID).

```typescript
import { CORRELATION_ID_HEADER } from 'seed-common-lib';

// The header name is exported as a constant for reuse
console.log(CORRELATION_ID_HEADER); // 'X-Correlation-ID'
```

**Loading Indicator Technical Details:**

The loading indicator uses a reference counting mechanism to handle multiple concurrent HTTP requests:

1. **Initial State**: `refCount = 0`, spinner hidden
2. **First Request Starts**: `refCount = 1`, spinner shows
3. **Second Request Starts**: `refCount = 2`, spinner stays visible
4. **First Request Completes**: `refCount = 1`, spinner stays visible
5. **Second Request Completes**: `refCount = 0`, spinner hides

This ensures the spinner remains visible until ALL operations complete. The system logs reference count changes to the console as `>>>RefCount #N` for debugging.

**Loading Indicator Manual Control:**
```typescript
import { LoadingIndicatorService } from 'seed-common-lib';

export class MyComponent {
  private loadingService = inject(LoadingIndicatorService);

  performAction(): void {
    this.loadingService.showWaitSpinner();
    // Do work
    this.loadingService.hideWaitSpinner();
  }
}
```

**Signup/Signin Component:**

A modern, fully-typed signup and signin component demonstrating Angular v21 best practices with **Signal Forms API**, signals, and modal dialogs.

**Features:**
- **Angular v21 Signal Forms API** - Uses experimental `form()` function from `@angular/forms/signals`
- **Signal-based form models** - Form data stored in writable signals
- **Schema-based validation** - Path-based validators with custom error messages
- **Signal inputs/outputs** - Modern `input()` and `output()` API
- **Computed signals** - Cross-field validation using computed signals
- **Field directive** - Uses `[field]` directive instead of `formControlName`
- **Modal dialogs** - Separate signal-based modals for signup and signin forms
- **Keyboard shortcuts** - Open modals via Ctrl+Shift+U (signup) or Ctrl+Shift+I (signin)
- **OnPush change detection** - Optimized performance
- **Modern control flow** - Uses `@if` syntax
- **Form validation** - Required fields, email format, minimum length, and password matching

**Input Parameters:**
- `githubLogoPath` (signal input, optional): URL path to GitHub logo image. Defaults to empty string.

**Output Events:**
- `signUp` (signal output): Emitted when signup form is submitted with valid data. Emits `{ email: string; password: string }`.
- `signIn` (signal output): Emitted when signin form is submitted with valid data. Emits `{ email: string; password: string }`.

**Usage:**
```typescript
import { SignupSigninComponent } from 'seed-common-lib';

@Component({
  imports: [SignupSigninComponent],
  template: `
    <lib-signup-signin 
      [githubLogoPath]="'assets/github-logo.png'"
      (signUp)="handleSignUp($event)"
      (signIn)="handleSignIn($event)"
    />
  `
})
export class MyComponent {
  handleSignUp(event: { email: string; password: string }): void {
    console.log('Sign up:', event);
    // Handle signup logic
  }

  handleSignIn(event: { email: string; password: string }): void {
    console.log('Sign in:', event);
    // Handle signin logic
  }
}
```

**Technical Implementation:**

The component uses Angular v21 Signal Forms API (experimental):

1. **Signal Form Models:**
   ```typescript
   readonly signUpModel = signal({
     email: '',
     password: '',
     confirmPassword: '',
   });
   
   readonly signInModel = signal({
     email: '',
     password: '',
   });
   ```
   Form data is stored in writable signals, providing the source of truth for form values.

2. **Signal Forms with Schema-Based Validation:**
   ```typescript
   readonly signUpForm = form(this.signUpModel, (fieldPath) => {
     required(fieldPath.email, { message: 'Email is required' });
     email(fieldPath.email, { message: 'Enter a valid email address' });
     required(fieldPath.password, { message: 'Password is required' });
     minLength(fieldPath.password, 5, {
       message: 'Password must be at least 5 characters',
     });
     required(fieldPath.confirmPassword, {
       message: 'Confirm password is required',
     });
     minLength(fieldPath.confirmPassword, 5, {
       message: 'Confirm password must be at least 5 characters',
     });
   });
   ```
   Uses the `form()` function with a schema function that binds validators to field paths. All validation rules are defined in one place with custom error messages.

3. **Computed Signal for Cross-Field Validation:**
   ```typescript
   readonly passwordsMatch = computed(() => {
     const model = this.signUpModel();
     return model.password === model.confirmPassword;
   });
   ```
   Uses a computed signal to check if passwords match, providing reactive cross-field validation.

4. **Signal-Based Form Access:**
   ```typescript
   // Form is accessed as a signal
   if (!this.signUpForm().valid()) {
     return;
   }
   
   // Field states are accessed as signals
   signUpForm.email().touched()
   signUpForm.email().invalid()
   signUpForm.email().errors()[0]?.message
   
   // Values come from the model signal
   const credentials = this.signUpModel();
   ```

5. **Field Directive in Template:**
   ```html
   <input [field]="signUpForm.email" />
   @if (signUpForm.email().touched() && signUpForm.email().invalid()) {
     <span>{{ signUpForm.email().errors()[0]?.message }}</span>
   }
   ```
   Uses the `Field` directive from `@angular/forms/signals` instead of `formControlName`. Field states are accessed as signals with methods like `touched()`, `invalid()`, and `errors()`.

6. **Form Validation Rules:**
   - Email: Required, valid email format
   - Password: Required, minimum 5 characters
   - Confirm Password: Required, minimum 5 characters
   - Cross-field: Passwords must match (via computed signal)

7. **Modal Management:**
   - Separate signal-based modals (`showSignUpModal`, `showSignInModal`)
   - Click outside to close
   - Close button in header
   - Auto-closes after successful form submission (10-second timeout)
   - Form models reset when modals close

8. **Modern Angular Patterns:**
   - **Standalone component** - No NgModules
   - **OnPush change detection** - Optimized performance
   - **Signal inputs/outputs** - `input()` and `output()` instead of decorators
   - **Modern control flow** - `@if` instead of `*ngIf`
   - **Signal-based state** - All state managed with signals

**Keyboard Shortcuts:**
- Press **Ctrl+Shift+U** (Windows/Linux) or **Cmd+Shift+U** (Mac) to open the signup modal
- Press **Ctrl+Shift+I** (Windows/Linux) or **Cmd+Shift+I** (Mac) to open the signin modal

The keyboard handlers are managed at the app level (in `AppComponent`) and call the component's `openSignUpModal()` and `openSignInModal()` methods.

**Testing:**

The component includes comprehensive test coverage using Vitest:

1. **Component Initialization Tests:**
   - Component creation
   - Modal state initialization (closed by default)
   - Submitted data initialization (null by default)
   - Form model initialization with empty values
   - Default input values

2. **Form Validation Tests - Sign Up:**
   - Email validation (required, invalid format, valid format)
   - Password validation (required, too short, valid length)
   - Confirm password validation (required)
   - Password matching validation (mismatch, match, empty fields)

3. **Form Validation Tests - Sign In:**
   - Email validation (required, invalid format)
   - Password validation (required, too short)

4. **Modal Management Tests:**
   - Open/close signup modal
   - Open/close signin modal
   - Clear submitted data when closing modals

5. **Form Submission Tests - Sign Up:**
   - Prevent submission when form is invalid
   - Emit signUp event with correct data when valid
   - Store submitted data after successful submission
   - Validate all fields on submit attempt

6. **Form Submission Tests - Sign In:**
   - Prevent submission when form is invalid
   - Emit signIn event with correct data when valid
   - Store submitted data after successful submission
   - Validate all fields on submit attempt

7. **Submitted Data Timeout Tests:**
   - Clear submitted signup data after 10 seconds
   - Clear submitted signin data after 10 seconds
   - Clear previous timeout when submitting again
   - Cancel timeout when closing modal manually

8. **Signal Forms API Tests:**
   - Verify form signals return correct structure
   - Verify field accessors exist
   - Verify form state updates when model changes

9. **Input/Output Tests:**
   - Accept githubLogoPath input
   - Emit signUp output event with correct data
   - Emit signIn output event with correct data

10. **Edge Cases Tests:**
    - Handle multiple rapid submissions
    - Prevent submission when email is missing
    - Prevent submission when password is missing
    - Prevent submission when confirmPassword is missing
    - Prevent submission when passwords do not match
    - Handle form reset after submission

All tests use Vitest with fake timers for timeout testing and proper signal-based assertions for form state validation.

### Keyboard Shortcuts

- **Ctrl+Shift+E** (Windows/Linux) or **Cmd+Shift+E** (Mac) - Open error testing modal
- **Ctrl+Shift+W** (Windows/Linux) or **Cmd+Shift+W** (Mac) - Open loading spinner test modal
- **Ctrl+Shift+U** (Windows/Linux) or **Cmd+Shift+U** (Mac) - Open signup modal
- **Ctrl+Shift+I** (Windows/Linux) or **Cmd+Shift+I** (Mac) - Open signin modal

## Troubleshooting

### Clear Cache

If you experience issues with stale code or the dev server not picking up changes:

```bash
# Stop the dev server (Ctrl+C)
rm -rf .angular/cache
pnpm start
```

### Hard Refresh Browser

After rebuilding libraries, do a hard refresh in your browser:
- **Windows/Linux**: Ctrl+Shift+R
- **Mac**: Cmd+Shift+R

## Additional Resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Angular Standalone Components](https://angular.dev/guide/components/importing)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
