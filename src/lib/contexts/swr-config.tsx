"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { apiClient } from "@/lib/api";
import { logger } from "@/lib/utils/logger";

/**
 * Global SWR fetcher using our apiClient
 * This ensures all SWR requests use the same authentication and error handling
 */
async function fetcher<T>(url: string): Promise<T> {
    return apiClient.get<T>(url);
}

/**
 * Global SWR configuration provider
 * Wraps the application to provide consistent data fetching behavior
 */
export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig
            value={{
                // Use our custom fetcher that includes auth tokens
                fetcher,

                // Revalidate on window focus to keep data fresh
                revalidateOnFocus: true,

                // Revalidate when user reconnects to network
                revalidateOnReconnect: true,

                // Don't revalidate on mount if data is already cached
                revalidateOnMount: true,

                // Dedupe requests within 2 seconds
                dedupingInterval: 2000,

                // Keep cache for 5 minutes by default
                focusThrottleInterval: 5000,

                // Retry failed requests up to 3 times with exponential backoff
                shouldRetryOnError: true,
                errorRetryCount: 3,
                errorRetryInterval: 5000,

                // Global error handler
                onError: (error, key) => {
                    logger.error("SWR Error", { key, error });
                    // Note: Individual components should handle their own error UI
                    // This is just for logging/monitoring purposes
                },

                // Global success handler for monitoring
                onSuccess: (data, key) => {
                    logger.debug("SWR Success", { key, dataType: typeof data });
                },

                // Compare function to determine if data has changed
                compare: (a, b) => {
                    // Deep equality check - SWR uses this to prevent unnecessary re-renders
                    return JSON.stringify(a) === JSON.stringify(b);
                },
            }}
        >
            {children}
        </SWRConfig>
    );
}
