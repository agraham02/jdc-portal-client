/**
 * Centralized error logging utility
 * Provides consistent error logging across the application
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
    [key: string]: unknown;
}

interface StructuredLog {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === "development";

    /**
     * Format structured log for console output
     */
    private formatLog(log: StructuredLog): string {
        const parts = [
            `[${log.timestamp}]`,
            `[${log.level.toUpperCase()}]`,
            log.message,
        ];

        if (log.context && Object.keys(log.context).length > 0) {
            parts.push(`Context: ${JSON.stringify(log.context)}`);
        }

        if (log.error) {
            parts.push(`Error: ${log.error.name}: ${log.error.message}`);
            if (log.error.stack && this.isDevelopment) {
                parts.push(`\nStack: ${log.error.stack}`);
            }
        }

        return parts.join(" ");
    }

    /**
     * Create structured log object
     */
    private createLog(
        level: LogLevel,
        message: string,
        context?: LogContext,
        error?: Error
    ): StructuredLog {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            error: error
                ? {
                      name: error.name,
                      message: error.message,
                      stack: error.stack,
                  }
                : undefined,
        };
    }

    /**
     * Send log to external service (e.g., Sentry, DataDog)
     */
    private sendToExternalService(log: StructuredLog): void {
        // Only send errors and critical warnings to external service
        if (log.level === "error" || log.level === "warn") {
            // Dynamically import Sentry to avoid bundling if not used
            import("@/lib/services/sentry")
                .then((sentry) => {
                    if (log.error) {
                        sentry.captureException(
                            new Error(log.error.message),
                            log.context
                        );
                    } else {
                        sentry.captureMessage(
                            log.message,
                            log.level === "error" ? "error" : "warning",
                            log.context
                        );
                    }
                })
                .catch(() => {
                    // Sentry not available, fail silently
                });
        }
    }

    /**
     * Log debug message (only in development)
     */
    debug(message: string, context?: LogContext): void {
        if (!this.isDevelopment) return;

        const log = this.createLog("debug", message, context);
        console.debug(this.formatLog(log));
    }

    /**
     * Log informational message
     */
    info(message: string, context?: LogContext): void {
        const log = this.createLog("info", message, context);
        console.info(this.formatLog(log));
    }

    /**
     * Log warning message
     */
    warn(message: string, context?: LogContext, error?: Error): void {
        const log = this.createLog("warn", message, context, error);
        console.warn(this.formatLog(log));

        if (error) {
            this.sendToExternalService(log);
        }
    }

    /**
     * Log error message
     */
    error(message: string, context?: LogContext, error?: Error): void {
        const log = this.createLog("error", message, context, error);
        console.error(this.formatLog(log));
        this.sendToExternalService(log);
    }

    /**
     * Log API errors with structured context
     */
    apiError(
        endpoint: string,
        method: string,
        error: Error,
        statusCode?: number,
        context?: LogContext
    ): void {
        this.error(
            `API ${method} ${endpoint} failed`,
            {
                endpoint,
                method,
                statusCode,
                ...context,
            },
            error
        );
    }

    /**
     * Log authentication errors
     */
    authError(message: string, userId?: string, error?: Error): void {
        this.error(
            message,
            {
                userId,
                type: "authentication",
            },
            error
        );
    }

    /**
     * Log WebSocket errors
     */
    wsError(event: string, error: Error, context?: LogContext): void {
        this.error(
            `WebSocket error on ${event}`,
            {
                event,
                ...context,
            },
            error
        );
    }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
