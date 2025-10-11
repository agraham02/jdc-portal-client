/**
 * Centralized SWR configuration
 * Single source of truth for all SWR settings across the application
 */

import type { SWRConfiguration } from "swr";
import { logger } from "../utils/logger";

/**
 * Default SWR configuration used across all hooks and contexts
 *
 * This configuration balances freshness with performance:
 * - Revalidates on focus and reconnect to keep data current
 * - Dedupes requests to prevent redundant API calls
 * - Retries failed requests with exponential backoff
 * - Logs errors and successes for monitoring
 */
export const swrConfig: SWRConfiguration = {
    // Revalidation settings
    revalidateOnFocus: false, // Don't refetch when window regains focus (can be noisy)
    revalidateOnReconnect: true, // Refetch when reconnecting to network
    revalidateOnMount: true, // Revalidate when component mounts
    revalidateIfStale: true, // Revalidate if data is stale

    // Performance settings
    dedupingInterval: 2000, // Dedupe identical requests within 2 seconds
    focusThrottleInterval: 5000, // Throttle focus revalidation to every 5 seconds
    loadingTimeout: 3000, // Timeout for slow requests (ms)

    // Error handling
    shouldRetryOnError: true, // Retry failed requests
    errorRetryCount: 3, // Retry failed requests up to 3 times
    errorRetryInterval: 1000, // Wait 1 second between retries (exponential backoff applied)

    // Callbacks for monitoring
    onError: (error, key) => {
        logger.error("SWR Error", { key, error });
        // Individual components should handle their own error UI
        // This is just for logging/monitoring purposes
    },

    onSuccess: (data, key) => {
        logger.debug("SWR Success", { key, dataType: typeof data });
    },

    // Data comparison function
    // SWR uses this to determine if data has changed and prevent unnecessary re-renders
    compare: (a, b) => {
        // Deep equality check using JSON stringification
        // For more complex scenarios, consider using a library like fast-deep-equal
        return JSON.stringify(a) === JSON.stringify(b);
    },
};

/**
 * Configuration for immutable data (won't revalidate)
 * Use for data that never changes (e.g., permission lists, static configurations)
 */
export const immutableSwrConfig: SWRConfiguration = {
    ...swrConfig,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
};

/**
 * Configuration for polling/real-time data
 * Use with refreshInterval option for data that needs frequent updates
 *
 * @example
 * ```typescript
 * useApi('/stats', { ...pollingSwrConfig, refreshInterval: 5000 })
 * ```
 */
export const pollingSwrConfig: SWRConfiguration = {
    ...swrConfig,
    revalidateOnFocus: true, // Always revalidate on focus for real-time data
    dedupingInterval: 0, // Don't dedupe polling requests
};
