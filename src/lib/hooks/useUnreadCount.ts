import { useNotificationContext } from "@/lib/contexts/notification-context";

interface UseUnreadCountReturn {
    unreadCount: number;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to get unread notification count from the global context
 * This ensures all components share the same notification state
 */
export function useUnreadCount(): UseUnreadCountReturn {
    const context = useNotificationContext();

    return {
        unreadCount: context.unreadCount,
        loading: context.loading,
        error: context.error,
        refetch: context.refetch,
    };
}
