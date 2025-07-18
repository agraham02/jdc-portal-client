import { useEffect, useMemo } from "react";
import { useNotificationContext } from "@/lib/contexts/notification-context";
import type {
    NotificationQueryParams,
    Notification,
} from "@/lib/types/notifications";

interface UseNotificationsReturn {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        totalPages: number;
        page: number;
        limit: number;
    };
    unreadCount: number;
    refetch: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
}

/**
 * Hook to use notifications from the global context with optional parameters
 * This ensures all notification data comes from a single source and reduces API calls
 */
export function useNotifications(
    params: NotificationQueryParams = {}
): UseNotificationsReturn {
    const context = useNotificationContext();

    // Memoize params to prevent unnecessary re-fetches
    const stableParams = useMemo(() => {
        return JSON.stringify(params);
    }, [params]);

    // Fetch notifications with new params when they change
    useEffect(() => {
        const parsedParams = JSON.parse(stableParams);
        // Only fetch if params are different from last params or if not initialized
        const paramsChanged =
            JSON.stringify(context.lastParams) !== stableParams;

        if (
            !context.initialized ||
            (paramsChanged && Object.keys(parsedParams).length > 0)
        ) {
            context.fetchNotifications(parsedParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stableParams, context.initialized]); // context intentionally partial to prevent excessive re-renders

    return {
        notifications: context.notifications,
        loading: context.loading,
        error: context.error,
        pagination: context.pagination,
        unreadCount: context.unreadCount,
        refetch: context.refetch,
        markAsRead: context.markAsRead,
        markAllAsRead: context.markAllAsRead,
        deleteNotification: context.deleteNotification,
        loadMore: context.loadMore,
        hasMore: context.hasMore,
    };
}
