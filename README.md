# AngularSeed

A modern Angular 20 seed project with comprehensive error handling, workspace architecture, and best practices.

## Technology Stack

- **Angular 20.0.0** - Latest Angular framework
- **TypeScript 5.8.0** - Strongly typed JavaScript
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
- Token interceptor for access and refresh tokens
- HTTP interceptor with correlation ID
- Responsive design with mobile support

### Modern Angular Practices
- **Standalone components** - No NgModules
- **TODO: Simplified filenames** - No `.component`, `.service` suffixes
- **OnPush change detection** - Optimized performance
- **Control flow syntax** - `@if`, `@for` instead of `*ngIf`, `*ngFor`
- **Zoneless change detection** - `provideZonelessChangeDetection()`
- **Signals** - Modern reactive state management
- **Functional interceptors** - Modern HTTP interceptor pattern

## Angular Version

Originally generated with Angular CLI 19.0.6, upgraded to **Angular 20.0.0**

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation

```bash
npm install
```

### Start the Project Locally

To start a local development server, run:

```bash
npm start
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
npm run lint:all
```

To lint individual projects:

```bash
npm run lint:seed-app
npm run lint:seed-common-lib
npm run lint:global-error-handler-lib
```

#### Code Formatting

The project uses Prettier for consistent code formatting. To format all files:

```bash
npm run format
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
npm run gitbuild
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
npm run build-libs
```

This builds both `seed-common-lib` and `global-error-handler-lib` in production mode.

To build only the application:

```bash
npm run build-app
```

This builds the seed-app with production optimizations and AOT compilation.

To build individual libraries:

```bash
# Build seed-common-lib in production mode
npm run build:seed-common-lib

# Build global-error-handler-lib in production mode
npm run build:global-error-handler-lib

# Build libraries in development mode
npm run build:seed-common-lib:dev
npm run build:global-error-handler-lib:dev
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

To execute all unit tests:

```bash
npm test
```

Or run tests in watch mode (automatically re-runs on file changes):

```bash
npm run test:watch
```

### Run Tests with UI

For an interactive test interface:

```bash
npm run test:ui
```

### Run Tests with Coverage

To generate code coverage reports:

```bash
npm run test:coverage
```

### Run Tests for Specific Projects

To run tests for a specific project:

```bash
npm run test:seed-app
npm run test:seed-common-lib
npm run test:global-error-handler-lib
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
2. **Simplified filenames** - Do not include `.component`, `.service`, `.pipe`, or `.directive` in filenames
   - `header.ts` instead of `header.component.ts`
   - `auth.ts` instead of `auth.service.ts`
3. **OnPush change detection** - Always use `ChangeDetectionStrategy.OnPush`
4. **Modern control flow** - Use `@if`, `@for` instead of `*ngIf`, `*ngFor`
5. **Zoneless change detection** - The app uses `provideZonelessChangeDetection()`
6. **Signals over RxJS** - Prefer Angular signals for state management

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
- Signal-based reactive state management
- Customizable loading adapters
- Testing component for loading scenarios

**Usage:**
```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor, LoadingSpinnerComponent } from 'seed-common-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([loadingInterceptor]))
  ]
};

@Component({
  imports: [LoadingSpinnerComponent],
  template: `<lib-loading-spinner />`
})
export class AppComponent {}
```

**Technical Details:**

The loading indicator uses a reference counting mechanism to handle multiple concurrent HTTP requests:

1. **Initial State**: `refCount = 0`, spinner hidden
2. **First Request Starts**: `refCount = 1`, spinner shows
3. **Second Request Starts**: `refCount = 2`, spinner stays visible
4. **First Request Completes**: `refCount = 1`, spinner stays visible
5. **Second Request Completes**: `refCount = 0`, spinner hides

This ensures the spinner remains visible until ALL operations complete. The system logs reference count changes to the console as `>>>RefCount #N` for debugging.

**Manual Control:**
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

### Keyboard Shortcuts

- **Ctrl+Shift+E** (Windows/Linux) or **Cmd+Shift+E** (Mac) - Open error testing modal
- **Ctrl+Shift+W** (Windows/Linux) or **Cmd+Shift+W** (Mac) - Open loading spinner test modal

## Troubleshooting

### Clear Cache

If you experience issues with stale code or the dev server not picking up changes:

```bash
# Stop the dev server (Ctrl+C)
rm -rf .angular/cache
npm start
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
