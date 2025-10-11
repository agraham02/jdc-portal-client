/**
 * SWR hooks for efficient API data fetching and caching
 * Reduces redundant API calls and provides automatic revalidation
 */

import useSWR, { type SWRConfiguration } from "swr";
import { apiClient } from "@/lib/api";
import {
    swrConfig,
    immutableSwrConfig,
    pollingSwrConfig,
} from "@/lib/config/swr";

/**
 * Generic SWR fetcher using apiClient
 */
async function fetcher<T>(url: string): Promise<T> {
    return apiClient.get<T>(url);
}

/**
 * Use SWR for GET requests with automatic caching
 *
 * @example
 * const { data, error, isLoading, mutate } = useApi<User[]>('/users');
 */
export function useApi<T>(url: string | null, config?: SWRConfiguration) {
    const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
        url, // null disables the request
        fetcher,
        { ...swrConfig, ...config }
    );

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate, // Manually trigger revalidation
    };
}

/**
 * Use SWR for paginated GET requests
 *
 * @example
 * const { data, error, isLoading } = usePaginatedApi<User>('/users', { page: 1, limit: 20 });
 */
export function usePaginatedApi<T>(
    basePath: string,
    params?: Record<string, string | number | boolean>,
    config?: SWRConfiguration
) {
    // Build query string from params
    const queryString = params
        ? "?" +
          Object.entries(params)
              .filter(([, value]) => value !== undefined && value !== null)
              .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
              .join("&")
        : "";

    const url = basePath + queryString;

    return useApi<T>(url, config);
}

/**
 * Use SWR with conditional fetching
 * Only fetches when condition is true
 *
 * @example
 * const { data } = useConditionalApi<User>('/users/me', isAuthenticated);
 */
export function useConditionalApi<T>(
    url: string,
    condition: boolean,
    config?: SWRConfiguration
) {
    return useApi<T>(condition ? url : null, config);
}

/**
 * Use SWR with automatic refresh interval
 *
 * @example
 * const { data } = usePollingApi<Stats>('/stats', 5000); // Refresh every 5 seconds
 */
export function usePollingApi<T>(
    url: string,
    intervalMs: number,
    config?: SWRConfiguration
) {
    return useApi<T>(url, {
        ...pollingSwrConfig,
        ...config,
        refreshInterval: intervalMs,
    });
}

/**
 * Use SWR for immutable data (won't revalidate)
 * Useful for data that never changes
 *
 * @example
 * const { data } = useImmutableApi<Permission[]>('/permissions');
 */
export function useImmutableApi<T>(url: string, config?: SWRConfiguration) {
    return useApi<T>(url, {
        ...immutableSwrConfig,
        ...config,
    });
}
