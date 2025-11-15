import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface ErrorNotification {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
    timestamp: Date;
    route?: string;           // Angular route path when error occurred
    httpStatus?: number;      // HTTP status code for HTTP errors
    autoHide?: boolean;
    duration?: number;
    callStack?: string[];
    errorContext?: {
        url?: string;
        userAgent?: string;
        errorType?: string;
        originalError?: any;
    };
    action?: {
        label: string;
        handler: () => void;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ErrorNotificationService {
    private router = inject(Router);
    private notifications = signal<ErrorNotification[]>([]);
    // Separate history for debugging/monitoring with call stacks
    errorHistory = signal<ErrorNotification[]>([]);
    private nextId = 1;

    // Expose notifications as a computed signal for reactive access
    public readonly notificationsSignal = computed(() => this.notifications());

    // Expose error history as a computed signal for debugging/monitoring
    public readonly errorHistorySignal = computed(() => this.errorHistory());

    /**
     * Add an error with call stack information
     * This method should be called from error handlers that have access to the original error
     */
    addErrorWithCallStack(
        message: string,
        originalError?: any,
        errorType?: string,
        duration = 5000
    ): string {
        // For HTTP errors or errors without stack, generate one
        let callStack: string[];
        if (originalError?.stack) {
            callStack = this.extractCallStack(originalError);
        } else {
            // Generate a new stack trace from current location
            const stackError = new Error();
            callStack = this.extractCallStack(stackError);
        }
        
        const errorContext = {
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            errorType: errorType || originalError?.constructor?.name || 'Unknown',
            originalError: originalError
        };

        // Extract HTTP status if available
        const httpStatus = originalError?.status || originalError?.error?.status;

        // Get current Angular route
        const route = this.getCurrentRoute();

        console.log(`ERROR WITH STACK: ${message}`, { callStack, errorContext, route, httpStatus });

        return this.addNotification({
            message,
            type: 'error',
            autoHide: true,
            duration,
            callStack,
            errorContext,
            route,
            httpStatus
        }, true); // true means add to error history
    }

    showError(message: string, duration = 5000): string {
        console.log(`ERROR CAUGHT: ${message}`);
        
        // Generate call stack for this error
        const error = new Error(message);
        const callStack = this.extractCallStack(error);
        const route = this.getCurrentRoute();
        
        return this.addNotification({
            message,
            type: 'error',
            autoHide: true,
            duration,
            callStack,
            route,
            errorContext: {
                url: typeof window !== 'undefined' ? window.location.href : undefined,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                errorType: 'ManualError'
            }
        }, true); // Add to history
    }

    showWarning(message: string, duration = 4000): string {
        return this.addNotification({
            message,
            type: 'warning',
            autoHide: true,
            duration
        });
    }

    showInfo(message: string, duration = 3000): string {
        return this.addNotification({
            message,
            type: 'info',
            autoHide: true,
            duration
        });
    }

    showSuccess(message: string, duration = 3000): string {
        return this.addNotification({
            message,
            type: 'success',
            autoHide: true,
            duration
        });
    }

    showPersistent(message: string, type: ErrorNotification['type'] = 'error', action?: ErrorNotification['action']): string {
        return this.addNotification({
            message,
            type,
            autoHide: false,
            action
        });
    }

    dismiss(id: string): void {
        const current = this.notifications();
        this.notifications.set(current.filter((n: ErrorNotification) => n.id !== id));
    }

    dismissAll(): void {
        this.notifications.set([]);
    }

    /**
     * Get all errors from history (for debugging/monitoring)
     */
    getAllErrors(): ErrorNotification[] {
        return this.errorHistory();
    }

    /**
     * Clear error history
     */
    clearErrorHistory(): void {
        this.errorHistory.set([]);
    }

    /**
     * Alias for clearErrorHistory - clear the error history
     */
    clearHistory(): void {
        this.clearErrorHistory();
    }

    /**
     * Get current Angular route path
     */
    private getCurrentRoute(): string | undefined {
        try {
            return this.router?.url || undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Extract call stack from an error object
     */
    private extractCallStack(error?: any): string[] {
        if (!error) {
            // Generate current call stack
            const stack = new Error().stack;
            return this.parseStackTrace(stack, true);
        }

        if (error.stack) {
            return this.parseStackTrace(error.stack, false);
        }

        if (typeof error === 'string') {
            return [error];
        }

        // If no stack available, generate one
        const stack = new Error().stack;
        return this.parseStackTrace(stack, true);
    }

    /**
     * Parse stack trace string into array of meaningful stack frames
     */
    private parseStackTrace(stackTrace?: string, isGenerated = false): string[] {
        if (!stackTrace) {
            return ['Stack trace not available'];
        }

        const lines = stackTrace
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => line.trim());
        
        // If we have lines with 'at ', filter them
        const atLines = lines.filter(line => line.includes('at '));
        
        if (atLines.length > 0) {
            let filtered = atLines
                .filter(line =>
                    !line.includes('Zone.run') &&
                    !line.includes('ZoneDelegate') &&
                    !line.includes('zone.js')
                );
            
            // If this is a generated stack, skip the first few frames (ErrorNotificationService methods)
            if (isGenerated) {
                filtered = filtered.filter(line =>
                    !line.includes('ErrorNotificationService') &&
                    !line.includes('extractCallStack') &&
                    !line.includes('addErrorWithCallStack') &&
                    !line.includes('showError')
                );
            }
            
            // Clean up the stack trace to show more readable paths
            const cleaned = filtered.map(line => {
                // Try to extract meaningful file names from bundled paths
                if (line.includes('localhost:4200')) {
                    // Extract the part after localhost:4200
                    const match = line.match(/localhost:4200\/(.+?)(?:\?|$)/);
                    if (match) {
                        return line.replace(match[0], match[1]);
                    }
                }
                return line;
            });
            
            const result = cleaned.slice(0, 15);
            return result.length > 0 ? result : ['at (call location not available)'];
        }
        
        // If no 'at ' lines, return all lines (some browsers format differently)
        const result = lines.slice(0, 15);
        return result.length > 0 ? result : ['Stack trace format not recognized'];
    }

    private addNotification(config: Partial<ErrorNotification>, addToHistory = false): string {
        const notification: ErrorNotification = {
            id: `error-${this.nextId++}`,
            message: config.message || '',
            type: config.type || 'error',
            timestamp: new Date(),
            route: config.route,
            httpStatus: config.httpStatus,
            autoHide: config.autoHide ?? true,
            duration: config.duration || 5000,
            callStack: config.callStack,
            errorContext: config.errorContext,
            action: config.action
        };

        const current = this.notifications();
        this.notifications.set([...current, notification]);

        // Add to error history if requested (for errors with call stacks)
        if (addToHistory) {
            const currentHistory = this.errorHistory();
            this.errorHistory.set([...currentHistory, notification]);
        }

        // Auto-hide if configured
        if (notification.autoHide && notification.duration) {
            setTimeout(() => {
                this.dismiss(notification.id);
            }, notification.duration);
        }

        return notification.id;
    }
}