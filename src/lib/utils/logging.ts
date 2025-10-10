/**
 * Conditional logging utility
 * Suppresses logs in production to reduce console noise
 */

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = {
    /**
     * Log error messages (always shown, but with context in dev)
     */
    error: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.error(`[ERROR] ${message}`, ...args);
        } else {
            // In production, still log errors but without the prefix
            console.error(message, ...args);
        }
    },

    /**
     * Log warning messages (dev only)
     */
    warn: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },

    /**
     * Log info messages (dev only)
     */
    info: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.info(`[INFO] ${message}`, ...args);
        }
    },

    /**
     * Log debug messages (dev only)
     */
    debug: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },

    /**
     * Log messages (dev only)
     */
    log: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.log(`[LOG] ${message}`, ...args);
        }
    },

    /**
     * Always log regardless of environment (use sparingly)
     */
    always: (message: string, ...args: unknown[]) => {
        console.log(message, ...args);
    },
};
