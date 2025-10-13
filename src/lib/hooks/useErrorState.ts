import { useState, useCallback } from "react";
import type { StandardError } from "../types/errors";

interface UseErrorStateOptions {
    /**
     * Callback when error is set
     */
    onError?: (error: StandardError) => void;

    /**
     * Callback when error is cleared
     */
    onClear?: () => void;

    /**
     * Auto-clear error after specified milliseconds
     */
    autoClearMs?: number;
}

interface UseErrorStateReturn {
    /**
     * Current error state
     */
    error: StandardError | null;

    /**
     * Set error state
     */
    setError: (error: unknown) => void;

    /**
     * Clear error state
     */
    clearError: () => void;

    /**
     * Check if there's an error
     */
    hasError: boolean;

    /**
     * Get error message
     */
    errorMessage: string | null;

    /**
     * Get field errors if present
     */
    fieldErrors: Array<{ field: string; message: string }> | null;
}

/**
 * Standard error state hook for consistent error handling
 * 
 * @param options - Configuration options
 * @returns Error state and helpers
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { error, setError, clearError, hasError } = useErrorState();
 *   
 *   async function loadData() {
 *     try {
 *       const data = await fetchData();
 *       setData(data);
 *     } catch (err) {
 *       setError(err);
 *     }
 *   }
 *   
 *   if (hasError) {
 *     return <ErrorState error={error} onRetry={() => {
 *       clearError();
 *       loadData();
 *     }} />;
 *   }
 *   
 *   return <div>{data}</div>;
 * }
 * ```
 */
export function useErrorState(
    options: UseErrorStateOptions = {}
): UseErrorStateReturn {
    const [error, setErrorState] = useState<StandardError | null>(null);

    const setError = useCallback(
        (err: unknown) => {
            // Convert to StandardError
            let standardError: StandardError;

            if (err && typeof err === "object" && "code" in err) {
                // Already a StandardError
                standardError = err as StandardError;
            } else if (err instanceof Error) {
                // Convert Error to StandardError
                standardError = {
                    code: "Error",
                    message: err.message,
                };
            } else if (typeof err === "string") {
                // Convert string to StandardError
                standardError = {
                    code: "Error",
                    message: err,
                };
            } else {
                // Unknown error type
                standardError = {
                    code: "UnknownError",
                    message: "An unknown error occurred",
                };
            }

            setErrorState(standardError);
            options.onError?.(standardError);

            // Auto-clear if specified
            if (options.autoClearMs) {
                setTimeout(() => {
                    setErrorState(null);
                    options.onClear?.();
                }, options.autoClearMs);
            }
        },
        [options]
    );

    const clearError = useCallback(() => {
        setErrorState(null);
        options.onClear?.();
    }, [options]);

    const hasError = error !== null;

    const errorMessage = error?.message ?? null;

    const fieldErrors = error?.fieldErrors ?? null;

    return {
        error,
        setError,
        clearError,
        hasError,
        errorMessage,
        fieldErrors,
    };
}
