# Global Error Handler Library

A comprehensive Angular library for centralized error handling, monitoring, and user notifications.

## Features

### Error Handling

- **Global Error Handler**: Catches all unhandled errors in the application
- **HTTP Error Interceptor**: Handles HTTP errors with user-friendly messages
- **Promise Rejection Handler**: Catches unhandled promise rejections
- **Resource Loading Errors**: Detects and handles failed resource loads
- **Call Stack Tracking**: Captures detailed error call stacks

### User Notifications

- **Toast Notifications**: Non-intrusive error, warning, info, and success messages
- **Error History**: Tracks all errors with timestamps and context
- **Visual Indicator**: Shows error count badge
- **Error Details Modal**: View detailed error information and call stacks

## Installation

```bash
npm install global-error-handler-lib
```

## Usage

### Basic Setup

1. **Provide the error handling configuration** in your app config:

```typescript
import { provideErrorHandling } from 'global-error-handler-lib';

export const appConfig: ApplicationConfig = {
  providers: [
    provideErrorHandling()
  ]
};
```

2. **Add error notification component** to your app template:

```typescript
import { ErrorNotificationComponent } from 'global-error-handler-lib';

@Component({
  imports: [ErrorNotificationComponent],
  template: `
    <lib-error-notification />
    <!-- Your app content -->
  `
})
export class AppComponent {}
```

### Manual Error Notifications

```typescript
import { ErrorNotificationService } from 'global-error-handler-lib';

export class MyComponent {
  private notificationService = inject(ErrorNotificationService);

  showError(): void {
    this.notificationService.showError('Something went wrong!', 5000);
  }

  showWarning(): void {
    this.notificationService.showWarning('Please check your input', 4000);
  }

  showInfo(): void {
    this.notificationService.showInfo('Processing your request', 3000);
  }

  showSuccess(): void {
    this.notificationService.showSuccess('Operation completed!', 3000);
  }
}
```

### Error History

Access error history using signals:

```typescript
import { ErrorNotificationService } from 'global-error-handler-lib';

export class MyComponent {
  private notificationService = inject(ErrorNotificationService);
  
  errorHistory = this.notificationService.errorHistorySignal;

  clearHistory(): void {
    this.notificationService.clearErrorHistory();
  }
}
```

## Technical Details

### Error Handling Flow

1. **Error Occurs**: Application throws an error
2. **Global Handler Catches**: `GlobalErrorHandler` intercepts the error
3. **Error Processing**: Extracts error details, type, and call stack
4. **User Notification**: Shows user-friendly message via toast
5. **Error Logging**: Logs to console and stores in history
6. **Optional Reporting**: Can send to monitoring service (Sentry, etc.)

### Error Types Handled

- **JavaScript Errors**: Standard Error objects
- **HTTP Errors**: 4xx and 5xx status codes
- **Promise Rejections**: Unhandled promise failures
- **Resource Loading**: Failed script/image/stylesheet loads
- **Timeout Errors**: setTimeout/setInterval errors
- **Type Errors**: Null/undefined access errors
- **Reference Errors**: Undefined variable access

### HTTP Error Mapping

The library provides user-friendly messages for common HTTP errors:

| Status Code | User Message |
|-------------|--------------|
| 400 | Invalid request. Please check your input. |
| 401 | You need to log in to access this resource. |
| 403 | You don't have permission to access this resource. |
| 404 | The requested resource was not found. |
| 500 | Server error. Please try again later. |
| 502 | Service temporarily unavailable. |
| 503 | Service is currently down for maintenance. |

### Signal-Based Architecture

The service uses Angular signals for reactive state management:

```typescript
private errorHistorySubject = signal<ErrorNotification[]>([]);
public errorHistorySignal = this.errorHistorySubject.asReadonly();
```

### Call Stack Capture

Errors are captured with full call stack information:

```typescript
interface ErrorNotification {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  route?: string;
  httpStatus?: number;
  callStack?: string[];
  errorContext?: any;
}
```

### Error Context

Each error includes contextual information:

```typescript
{
  url: window.location.href,
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  errorType: 'HTTP Error' | 'JavaScript Error' | etc.
}
```

## Testing

Use the `GenerateErrorsComponent` to test error handling:

```typescript
import { GenerateErrorsComponent } from 'global-error-handler-lib';

@Component({
  imports: [GenerateErrorsComponent],
  template: `<lib-generate-errors />`
})
```

Press **Cmd+Shift+E** (Mac) or **Ctrl+Shift+E** (Windows/Linux) to open the error testing modal.

### Available Test Scenarios

- Simple JavaScript Error
- Type Error
- Reference Error
- Async Error
- HTTP 404, 500, 401, 402, 403
- Network Error
- Promise Rejection
- setTimeout Error
- Custom Notifications (Error, Warning, Info, Success)
- Error with Call Stack

## API Reference

### ErrorNotificationService

| Method | Description |
|--------|-------------|
| `showError(message, duration?)` | Show error toast notification |
| `showWarning(message, duration?)` | Show warning toast notification |
| `showInfo(message, duration?)` | Show info toast notification |
| `showSuccess(message, duration?)` | Show success toast notification |
| `addErrorWithCallStack(message, error, type?)` | Add error with call stack to history |
| `clearErrorHistory()` | Clear all error history |
| `errorHistorySignal` | Read-only signal of error history |

### GlobalErrorHandler

Automatically registered as Angular's `ErrorHandler`. No direct API needed.

### httpErrorInterceptor

Automatically intercepts HTTP errors. No direct API needed.

## Configuration

### Custom Error Reporting

Extend the `GlobalErrorHandler` to add custom error reporting:

```typescript
private reportError(error: any): void {
  // Send to your monitoring service
  // Example: Sentry, LogRocket, Application Insights
  this.monitoringService.captureError(error);
}
```

### Environment-Specific Behavior

```typescript
private isProduction(): boolean {
  return !isDevMode();
}
```

## Best Practices

1. **Don't Catch Everything**: Let the global handler catch unexpected errors
2. **Use Specific Messages**: Provide context-specific error messages
3. **Monitor Production**: Integrate with error monitoring services
4. **Test Error Scenarios**: Use the test component to verify error handling
5. **Clear History**: Periodically clear error history to prevent memory issues

## License

MIT
