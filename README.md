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
- `typescript-eslint/strictTypeChecked` - Strict type-checked rules
- `typescript-eslint/stylisticTypeChecked` - Stylistic rules with type information

**Custom TypeScript Rules:**
- `@typescript-eslint/consistent-type-imports` - Enforces `type` keyword for type-only imports
- `@typescript-eslint/no-floating-promises` - Requires promise handling
- `@typescript-eslint/no-misused-promises` - Prevents incorrect promise usage
- `@typescript-eslint/no-unnecessary-condition` - Flags always-true/false conditions
- `@typescript-eslint/prefer-nullish-coalescing` - Prefers `??` over `\|\|` for null/undefined checks
- `@typescript-eslint/prefer-optional-chain` - Prefers `?.` over verbose null checks
- `@typescript-eslint/no-explicit-any` - Warns on explicit `any` usage (encourages proper typing)
- `@typescript-eslint/use-unknown-in-catch-callback-variable` - Requires `unknown` in catch clauses

**Angular Component/Directive Rules:**
- `@angular-eslint/component-selector` - Enforces `kebab-case` with `app`/`lib` prefix
- `@angular-eslint/directive-selector` - Enforces `camelCase` attribute selectors
- `@angular-eslint/no-empty-lifecycle-method` - Prevents empty lifecycle methods
- `@angular-eslint/use-lifecycle-interface` - Requires implementing lifecycle interfaces
- `@angular-eslint/prefer-standalone` - Encourages standalone components

**Angular Template Rules:**
- `@angular-eslint/template/no-negated-async` - Prevents negated async pipes
- `@angular-eslint/template/use-track-by-function` - Requires trackBy functions in `*ngFor`

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

1. **Standalone Components** - No NgModules, use direct imports
2. **OnPush Change Detection** - Always use `ChangeDetectionStrategy.OnPush`
3. **Modern Control Flow** - Use `@if`, `@for`, `@switch` instead of structural directives
4. **Zoneless Change Detection** - App uses `provideZonelessChangeDetection()`
5. **Signals over RxJS** - Prefer Angular signals for state management
6. **Signal Inputs/Outputs** - Use `input()` and `output()` instead of decorators
7. **Typed Reactive Forms** - Use typed `FormGroup` and `FormControl`
8. **Functional Interceptors** - Use functional HTTP interceptors

### Code Quality Standards

- All components use `ChangeDetectionStrategy.OnPush`
- All state management uses Angular signals
- All forms use Signal Forms API or typed reactive forms
- All HTTP interceptors are functional
- All ESLint rules are followed (with documented exceptions)
- All TypeScript strict mode rules are enabled

## Reference

### Keyboard Shortcuts

- **Ctrl+Shift+E** / **Cmd+Shift+E** - Open error testing modal
- **Ctrl+Shift+W** / **Cmd+Shift+W** - Open loading spinner test modal
- **Ctrl+Shift+U** / **Cmd+Shift+U** - Open signup modal
- **Ctrl+Shift+I** / **Cmd+Shift+I** - Open signin modal

### Resources

- [Angular CLI Overview](https://angular.dev/tools/cli)
- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Angular Standalone Components](https://angular.dev/guide/components/importing)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
