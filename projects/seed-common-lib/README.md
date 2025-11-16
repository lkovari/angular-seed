# Seed Common Library

A reusable Angular library providing common UI components and utilities for enterprise applications.

## Features

### Loading Indicator System

A sophisticated loading spinner system with reference counting for managing multiple concurrent HTTP requests.

#### Components

- **LoadingSpinnerComponent** - Visual loading spinner overlay
- **WaitSpinnerTestComponent** - Testing interface for loading functionality

#### Services

- **LoadingIndicatorService** - Core service managing loading state with reference counting
- **loadingInterceptor** - HTTP interceptor for automatic loading state management

#### Key Features

- **Reference Counting**: Tracks multiple concurrent HTTP requests
- **Signal-Based**: Uses Angular signals for reactive state management
- **Customizable**: Supports custom loading adapters
- **Automatic**: HTTP interceptor handles loading state automatically
- **Manual Control**: Can be controlled programmatically when needed

## Installation

```bash
npm install seed-common-lib
```

## Usage

### Basic Setup

1. **Import the HTTP interceptor** in your app config:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from 'seed-common-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([loadingInterceptor])
    )
  ]
};
```

2. **Add the loading spinner component** to your app template:

```typescript
import { LoadingSpinnerComponent } from 'seed-common-lib';

@Component({
  imports: [LoadingSpinnerComponent],
  template: `
    <lib-loading-spinner />
    <!-- Your app content -->
  `
})
export class AppComponent {}
```

### Manual Control

```typescript
import { LoadingIndicatorService } from 'seed-common-lib';

export class MyComponent {
  private loadingService = inject(LoadingIndicatorService);

  performAction(): void {
    this.loadingService.showWaitSpinner();
    
    // Perform your action
    setTimeout(() => {
      this.loadingService.hideWaitSpinner();
    }, 2000);
  }
}
```

### Custom Loading Adapter

Create a custom adapter to use your own loading UI:

```typescript
import { LoadingIndicatorAdapter, LoadingIndicatorService } from 'seed-common-lib';

export class CustomLoadingAdapter implements LoadingIndicatorAdapter {
  show(): void {
    // Your custom show logic
  }

  hide(): void {
    // Your custom hide logic
  }
}

// Set the adapter
constructor() {
  const loadingService = inject(LoadingIndicatorService);
  loadingService.setAdapter(new CustomLoadingAdapter());
}
```

## Technical Details

### Reference Counting Mechanism

The loading indicator uses a reference counting system to handle multiple concurrent operations:

1. **Initial State**: `refCount = 0`, spinner hidden
2. **First Request**: `refCount = 1`, spinner shows
3. **Second Request**: `refCount = 2`, spinner stays visible
4. **First Completes**: `refCount = 1`, spinner stays visible
5. **Second Completes**: `refCount = 0`, spinner hides

This ensures the spinner remains visible until ALL operations complete.

### Signal-Based Architecture

The service uses Angular signals for reactive state management:

```typescript
private refCount = signal(0);
public readonly isLoading = computed(() => this.refCount() > 0);
```

This provides automatic change detection and optimal performance.

### HTTP Interceptor

The interceptor automatically manages loading state for all HTTP requests:

```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingIndicatorService);
  loadingService.showWaitSpinner();
  
  return next(req).pipe(
    finalize(() => loadingService.hideWaitSpinner())
  );
};
```

## Testing

Use the `WaitSpinnerTestComponent` to test loading functionality:

```typescript
import { WaitSpinnerTestComponent } from 'seed-common-lib';

@Component({
  imports: [WaitSpinnerTestComponent],
  template: `<lib-wait-spinner-test />`
})
```

Press **Cmd+Shift+W** (Mac) or **Ctrl+Shift+W** (Windows/Linux) to open the test modal.

## API Reference

### LoadingIndicatorService

| Method | Description |
|--------|-------------|
| `showWaitSpinner()` | Increment ref count and show spinner if needed |
| `hideWaitSpinner()` | Decrement ref count and hide spinner if needed |
| `forceHide()` | Reset ref count to 0 and hide spinner immediately |
| `getRefCount()` | Get current reference count (for debugging) |
| `setAdapter(adapter)` | Set custom loading adapter |
| `isLoading` | Computed signal indicating loading state |

### LoadingIndicatorAdapter Interface

```typescript
interface LoadingIndicatorAdapter {
  show(): void;
  hide(): void;
}
```

## License

MIT
