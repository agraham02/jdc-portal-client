import { toast } from "sonner";

export interface RetryOptions {
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number) => void;
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/**
 * Wait for network to come back online
 */
export function waitForOnline(): Promise<void> {
    return new Promise((resolve) => {
        if (navigator.onLine) {
            resolve();
        } else {
            const handleOnline = () => {
                window.removeEventListener("online", handleOnline);
                resolve();
            };
            window.addEventListener("online", handleOnline);
        }
    });
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        backoffMultiplier = 2,
        onRetry,
    } = options;

    let lastError: Error;
    let currentDelay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // If offline, wait for connection before attempting
            if (!isOnline()) {
                toast.error("No internet connection", {
                    description: "Waiting for connection to be restored...",
                });
                await waitForOnline();
                toast.success("Connection restored", {
                    description: "Retrying operation...",
                });
            }

            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on the last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Check if error is retryable
            if (!isRetryableError(error)) {
                throw error;
            }

            onRetry?.(attempt + 1);

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
            currentDelay *= backoffMultiplier;
        }
    }

    throw lastError!;
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const retryableCodes = [
        "NETWORK_ERROR",
        "TIMEOUT",
        "ECONNREFUSED",
        "ENOTFOUND",
        "ETIMEDOUT",
    ];

    // Check error message for network-related keywords
    const message = error.message.toLowerCase();
    const networkKeywords = [
        "network",
        "timeout",
        "connection",
        "fetch",
        "offline",
    ];

    return (
        retryableCodes.some((code) => message.includes(code.toLowerCase())) ||
        networkKeywords.some((keyword) => message.includes(keyword))
    );
}

/**
 * Setup global online/offline listeners
 */
export function setupNetworkListeners() {
    window.addEventListener("online", () => {
        toast.success("Connection restored", {
            description: "You're back online!",
        });
    });

    window.addEventListener("offline", () => {
        toast.error("No internet connection", {
            description: "Some features may not work until you're back online.",
        });
    });

    // Initial check
    if (!navigator.onLine) {
        toast.error("No internet connection", {
            description: "Please check your network connection.",
        });
    }
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
    url: string,
    options?: RequestInit,
    retryOptions?: RetryOptions
): Promise<Response> {
    return retryWithBackoff(
        async () => {
            const response = await fetch(url, options);

            // Retry on 5xx errors
            if (response.status >= 500) {
                throw new Error(`Server error: ${response.status}`);
            }

            return response;
        },
        {
            ...retryOptions,
            onRetry: (attempt) => {
                toast.info(`Retrying request`, {
                    description: `Attempt ${attempt} of ${
                        retryOptions?.maxRetries || 3
                    }...`,
                });
                retryOptions?.onRetry?.(attempt);
            },
        }
    );
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleNetworkError(error: unknown, context?: string): string {
    if (!navigator.onLine) {
        return "You're offline. Please check your internet connection and try again.";
    }

    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes("timeout")) {
            return "The request took too long. Please try again.";
        }

        if (message.includes("network") || message.includes("fetch")) {
            return "Network error. Please check your connection and try again.";
        }

        if (message.includes("abort")) {
            return "Request was cancelled. Please try again.";
        }

        // Return original error message if it's user-friendly
        if (error.message.length < 100 && !message.includes("http")) {
            return error.message;
        }
    }

    return context
        ? `Failed to ${context}. Please try again.`
        : "An unexpected error occurred. Please try again.";
}
