import { useEffect, useMemo, useRef } from "react";
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

export function useNotifications(
    params: NotificationQueryParams = {}
): UseNotificationsReturn {
    const context = useNotificationContext();
    const paramsRef = useRef<string>("");

    // Memoize the params to prevent unnecessary re-renders using deep comparison
    const stableParams = useMemo(
        () => params,
        [params.page, params.limit, params.type, params.read, params.search]
    );

    const paramsString = JSON.stringify(stableParams);

    // Fetch notifications when params change
    useEffect(() => {
        // Only fetch if params are different from last fetch
        if (paramsRef.current !== paramsString) {
            paramsRef.current = paramsString;

            // Only fetch if we have meaningful params or if it's the first load
            if (Object.keys(stableParams).length > 0 || !context.initialized) {
                context.fetchNotifications(stableParams);
            }
        }
    }, [paramsString, stableParams, context]);

    const hasMore = context.pagination.page < context.pagination.totalPages;

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
        hasMore,
    };
}
