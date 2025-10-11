/**
 * React hook for API calls with AbortController-based request cancellation
 * Prevents memory leaks and unnecessary network traffic when components unmount
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type { StandardError } from "@/lib/types/errors";

export interface UseApiWithAbortOptions<T = unknown> {
    /**
     * Execute the request immediately on mount
     * @default false
     */
    immediate?: boolean;
    /**
     * Callback when request succeeds
     */
    onSuccess?: (data: T) => void;
    /**
     * Callback when request fails
     */
    onError?: (error: StandardError) => void;
    /**
     * Callback when request is aborted
     */
    onAbort?: () => void;
}

export interface UseApiWithAbortReturn<T> {
    /** Response data */
    data: T | null;
    /** Error object if request failed */
    error: StandardError | null;
    /** Loading state */
    isLoading: boolean;
    /** Whether request was aborted */
    isAborted: boolean;
    /** Execute the request */
    execute: (
        method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
        body?: unknown
    ) => Promise<T | null>;
    /** Abort the current request */
    abort: () => void;
    /** Reset the hook state */
    reset: () => void;
}

/**
 * Hook for making abortable API requests
 * Automatically cancels requests when component unmounts
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { data, isLoading, error, execute, abort } = useApiWithAbort<User[]>(
 *     '/users',
 *     { immediate: true }
 *   );
 *
 *   // Manually trigger request
 *   const handleRefresh = () => execute();
 *
 *   // Manually abort request
 *   const handleCancel = () => abort();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   return <div>{data?.length} users</div>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // For long-running operations with manual control
 * function FileUpload() {
 *   const { execute, abort, isLoading } = useApiWithAbort<UploadResponse>(
 *     '/files/upload',
 *     {
 *       onSuccess: (data) => console.log('Upload complete:', data),
 *       onError: (error) => toast.error(error.message),
 *       onAbort: () => toast.info('Upload cancelled'),
 *     }
 *   );
 *
 *   const handleUpload = async (file: File) => {
 *     const formData = new FormData();
 *     formData.append('file', file);
 *     await execute('POST', formData);
 *   };
 *
 *   return (
 *     <>
 *       <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
 *       {isLoading && <button onClick={abort}>Cancel Upload</button>}
 *     </>
 *   );
 * }
 * ```
 */
export function useApiWithAbort<T = unknown>(
    url: string,
    options?: UseApiWithAbortOptions<T>
): UseApiWithAbortReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<StandardError | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAborted, setIsAborted] = useState(false);

    // Use ref to store AbortController so it persists across renders
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    /**
     * Execute the API request with abort support
     */
    const execute = useCallback(
        async (
            method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
            body?: unknown
        ): Promise<T | null> => {
            const httpMethod = method || "GET";
            // Abort any previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new AbortController for this request
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            setIsLoading(true);
            setError(null);
            setIsAborted(false);

            try {
                let response: T;

                switch (httpMethod) {
                    case "GET":
                        response = await apiClient.get<T>(url, { signal });
                        break;
                    case "POST":
                        response = await apiClient.post<T>(url, body, {
                            signal,
                        });
                        break;
                    case "PATCH":
                        response = await apiClient.patch<T>(url, body, {
                            signal,
                        });
                        break;
                    case "PUT":
                        response = await apiClient.put<T>(url, body, {
                            signal,
                        });
                        break;
                    case "DELETE":
                        response = await apiClient.delete<T>(url, { signal });
                        break;
                    default:
                        throw new Error(
                            `Unsupported HTTP method: ${httpMethod}`
                        );
                }

                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    setData(response);
                    setIsLoading(false);
                    options?.onSuccess?.(response);
                }

                return response;
            } catch (err) {
                // Check if error was due to abort
                if (err instanceof Error && err.name === "AbortError") {
                    if (isMountedRef.current) {
                        setIsAborted(true);
                        setIsLoading(false);
                        options?.onAbort?.();
                    }
                    return null;
                }

                // Handle other errors
                const standardError = err as StandardError;
                if (isMountedRef.current) {
                    setError(standardError);
                    setIsLoading(false);
                    options?.onError?.(standardError);
                }

                return null;
            }
        },
        [url, options]
    );

    /**
     * Abort the current request
     */
    const abort = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    /**
     * Reset the hook state
     */
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
        setIsAborted(false);
    }, []);

    // Execute immediately if requested
    useEffect(() => {
        if (options?.immediate) {
            execute();
        }
    }, [options?.immediate]); // eslint-disable-line react-hooks/exhaustive-deps

    // Cleanup: abort request on unmount
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        data,
        error,
        isLoading,
        isAborted,
        execute,
        abort,
        reset,
    };
}

/**
 * Simplified hook for GET requests with auto-execution
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useApiGet<User[]>('/users');
 * ```
 */
export function useApiGet<T = unknown>(
    url: string,
    options?: Omit<UseApiWithAbortOptions<T>, "immediate">
) {
    const result = useApiWithAbort<T>(url, { ...options, immediate: true });

    return {
        ...result,
        refetch: () => result.execute("GET"),
    };
}

/**
 * Hook for POST requests with manual trigger
 *
 * @example
 * ```typescript
 * const { mutate, isLoading } = useApiPost<CreateUserResponse>('/users');
 *
 * const handleSubmit = async (userData: CreateUserDto) => {
 *   const result = await mutate(userData);
 *   if (result) {
 *     toast.success('User created');
 *   }
 * };
 * ```
 */
export function useApiPost<T = unknown, TBody = unknown>(
    url: string,
    options?: UseApiWithAbortOptions<T>
) {
    const result = useApiWithAbort<T>(url, options);

    return {
        ...result,
        mutate: (body: TBody) => result.execute("POST", body),
    };
}
