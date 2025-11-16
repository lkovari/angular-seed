# Loading Indicator

A comprehensive loading indicator system with HTTP interceptor, reference counting, and customizable display.

## Features

- **HTTP Interceptor Based** - Automatically shows/hides for HTTP requests
- **Reference Counting** - Handles multiple concurrent requests
- **Customizable Display** - Use adapter pattern for custom spinners
- **Manual Control** - `showWaitSpinner()` and `hideWaitSpinner()` methods
- **Signal-Based** - Reactive `isLoading` signal
- **Default Spinner** - Built-in spinner if no adapter is set

## Installation

1. **Add the HTTP Interceptor** in `app.config.ts`:

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

2. **Add the Loading Spinner Component** to your app:

```typescript
// app.component.ts
import { LoadingSpinnerComponent } from 'seed-common-lib';

@Component({
  imports: [LoadingSpinnerComponent],
  template: `
    <router-outlet />
    <lib-loading-spinner />
  `
})
export class AppComponent {}
```

## Usage

### Automatic (HTTP Requests)

The loading indicator automatically shows/hides for all HTTP requests:

```typescript
// This will automatically show the loading spinner
this.http.get('/api/data').subscribe(data => {
  // Spinner automatically hides when request completes
});
```

### Manual Control

```typescript
import { LoadingIndicatorService } from 'seed-common-lib';

export class MyComponent {
  private loadingService = inject(LoadingIndicatorService);

  async doSomething() {
    // Show spinner
    this.loadingService.showWaitSpinner();

    try {
      await someAsyncOperation();
    } finally {
      // Hide spinner
      this.loadingService.hideWaitSpinner();
    }
  }
}
```

### Reference Counting

The service uses reference counting to handle multiple concurrent operations:

```typescript
// Request 1 starts - refCount: 0 → 1, spinner shows
this.http.get('/api/users').subscribe();

// Request 2 starts - refCount: 1 → 2, spinner stays visible
this.http.get('/api/posts').subscribe();

// Request 1 completes - refCount: 2 → 1, spinner stays visible
// Request 2 completes - refCount: 1 → 0, spinner hides
```

### Custom Adapter

Create a custom adapter to use your own loading UI:

```typescript
import { LoadingIndicatorAdapter, LoadingIndicatorService } from 'seed-common-lib';

// 1. Create custom adapter
export class CustomLoadingAdapter implements LoadingIndicatorAdapter {
  show(): void {
    // Your custom show logic
    // e.g., show Angular Material spinner, PrimeNG progress bar, etc.
  }

  hide(): void {
    // Your custom hide logic
  }
}

// 2. Set the adapter in your app
export class AppComponent {
  private loadingService = inject(LoadingIndicatorService);

  constructor() {
    this.loadingService.setAdapter(new CustomLoadingAdapter());
  }
}
```

### Using with Angular Material

```typescript
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LoadingIndicatorAdapter } from 'seed-common-lib';

export class MaterialLoadingAdapter implements LoadingIndicatorAdapter {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}

  show(): void {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        hasBackdrop: true,
        positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
      });
      
      const spinnerPortal = new ComponentPortal(MatProgressSpinner);
      this.overlayRef.attach(spinnerPortal);
    }
  }

  hide(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
```

## API

### LoadingIndicatorService

#### Methods

- `showWaitSpinner()` - Show loading indicator (increments ref count)
- `hideWaitSpinner()` - Hide loading indicator (decrements ref count)
- `setAdapter(adapter: LoadingIndicatorAdapter)` - Set custom display adapter
- `forceHide()` - Force hide all indicators (resets ref count to 0)
- `getRefCount()` - Get current reference count (for debugging)

#### Signals

- `isLoading` - Computed signal, `true` when ref count > 0

### LoadingIndicatorAdapter Interface

```typescript
interface LoadingIndicatorAdapter {
  show(): void;
  hide(): void;
}
```

## Examples

### Example 1: Multiple Concurrent Requests

```typescript
// All three requests start
this.http.get('/api/users').subscribe();    // refCount: 1
this.http.get('/api/posts').subscribe();    // refCount: 2
this.http.get('/api/comments').subscribe(); // refCount: 3

// Spinner shows once and stays visible until all complete
```

### Example 2: Mixed HTTP and Manual

```typescript
// Manual show
this.loadingService.showWaitSpinner(); // refCount: 1

// HTTP request
this.http.get('/api/data').subscribe(); // refCount: 2

// HTTP completes - refCount: 1, spinner still visible
// Manual hide - refCount: 0, spinner hides
this.loadingService.hideWaitSpinner();
```

### Example 3: Error Recovery

```typescript
try {
  this.loadingService.showWaitSpinner();
  await riskyOperation();
} catch (error) {
  // Force hide if something goes wrong
  this.loadingService.forceHide();
}
```

## Default Spinner

If no adapter is set, a default blue spinner is shown with a semi-transparent overlay.

## Best Practices

1. **Always pair show/hide** - Use try/finally or finalize operator
2. **Use HTTP interceptor** - Let it handle HTTP requests automatically
3. **Custom adapter for consistency** - Match your app's design system
4. **Force hide sparingly** - Only for error recovery scenarios
5. **Check isLoading signal** - Use for conditional UI rendering

## Troubleshooting

**Spinner doesn't hide:**
- Check that every `showWaitSpinner()` has a matching `hideWaitSpinner()`
- Use `getRefCount()` to debug reference count
- Use `forceHide()` to reset if needed

**Multiple spinners showing:**
- Ensure only one `<lib-loading-spinner />` in your app
- Check that custom adapter properly manages its display element
