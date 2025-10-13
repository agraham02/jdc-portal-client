/**
 * Sentry Error Tracking Integration
 *
 * This file provides a centralized integration point for Sentry error tracking.
 * To enable Sentry in production:
 *
 * 1. Install dependencies:
 *    npm install @sentry/nextjs
 *
 * 2. Run Sentry wizard:
 *    npx @sentry/wizard@latest -i nextjs
 *
 * 3. Set environment variables:
 *    NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
 *    SENTRY_AUTH_TOKEN=your_auth_token
 *
 * 4. Uncomment the code below and update logger.ts to use Sentry
 */

/*
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            environment: process.env.NODE_ENV,
            
            // Adjust sample rates for performance monitoring
            tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
            
            // Capture unhandled promise rejections
            integrations: [
                new Sentry.BrowserTracing(),
                new Sentry.Replay({
                    maskAllText: true,
                    blockAllMedia: true,
                }),
            ],
            
            // Session Replay sample rate
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            
            // Filter sensitive data
            beforeSend(event) {
                // Remove sensitive headers
                if (event.request?.headers) {
                    delete event.request.headers["Authorization"];
                    delete event.request.headers["Cookie"];
                }
                
                // Remove sensitive query params
                if (event.request?.query_string) {
                    const url = new URL("http://example.com" + event.request.url);
                    url.searchParams.delete("token");
                    url.searchParams.delete("password");
                    event.request.url = url.pathname + url.search;
                }
                
                return event;
            },
            
            // Ignore certain errors
            ignoreErrors: [
                // Browser extensions
                "ResizeObserver loop limit exceeded",
                "Non-Error promise rejection captured",
                // Network errors
                "NetworkError",
                "Failed to fetch",
            ],
        });
    }
}

export function captureException(
    error: Error,
    context?: Record<string, unknown>
) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(error, {
            contexts: context ? { custom: context } : undefined,
        });
    } else {
        console.error("[Sentry] Error captured (Sentry not initialized):", error, context);
    }
}

export function captureMessage(
    message: string,
    level: Sentry.SeverityLevel = "info",
    context?: Record<string, unknown>
) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureMessage(message, {
            level,
            contexts: context ? { custom: context } : undefined,
        });
    } else {
        console.log(`[Sentry] Message captured (${level}):`, message, context);
    }
}

export function setUserContext(user: {
    id: string;
    email?: string;
    accountType?: string;
}) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            account_type: user.accountType,
        });
    }
}

export function clearUserContext() {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.setUser(null);
    }
}
*/

// Placeholder functions when Sentry is not installed
export function initSentry() {
    console.log("[Sentry] Not initialized (install @sentry/nextjs to enable)");
}

export function captureException(
    error: Error,
    context?: Record<string, unknown>
) {
    console.error("[Sentry Placeholder] Exception:", error, context);
}

export function captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: Record<string, unknown>
) {
    console.log(
        `[Sentry Placeholder] ${level.toUpperCase()}:`,
        message,
        context
    );
}

export function setUserContext(user: {
    id: string;
    email?: string;
    accountType?: string;
}) {
    console.log("[Sentry Placeholder] User context set:", user);
}

export function clearUserContext() {
    console.log("[Sentry Placeholder] User context cleared");
}
