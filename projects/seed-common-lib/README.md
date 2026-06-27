# Seed Common Library

Infrastructure-only Angular library providing cross-cutting HTTP concerns for the seed workspace.

## Features

### Loading Indicator System

Reference-counted loading spinner for managing multiple concurrent HTTP requests.

- **LoadingSpinnerComponent** — Visual loading spinner overlay
- **LoadingIndicatorService** — Core service with reference counting
- **loadingInterceptor** — HTTP interceptor for automatic loading state

### HTTP Correlation ID

- **correlationIdInterceptor** — Injects `X-Correlation-ID` on every outbound request

## Usage

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor, correlationIdInterceptor, LoadingSpinnerComponent } from 'seed-common-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([correlationIdInterceptor, loadingInterceptor])),
  ],
};
```

```typescript
@Component({
  imports: [LoadingSpinnerComponent],
  template: `<lib-loading-spinner />`,
})
export class AppComponent {}
```

## Developer tooling

UI demos (wait-spinner test, slide-toggle, components-tests) and auth forms live in **seed-app feature slices** (`features/dev-tools/`, `features/auth/`), not in this library.

See the root [README.md](../../README.md) for vertical slice architecture and the loading indicator deep-dive in `src/lib/loading-indicator/README.md`.

## License

MIT
