"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { apiClient } from "@/lib/api";
import { swrConfig } from "@/lib/config/swr";

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
                // Use our centralized SWR configuration
                ...swrConfig,
                // Override fetcher with our custom one that includes auth tokens
                fetcher,
            }}
        >
            {children}
        </SWRConfig>
    );
}
