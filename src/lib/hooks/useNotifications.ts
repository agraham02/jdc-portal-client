import { useState, useEffect, useCallback, useMemo } from "react";
import { notificationService } from "@/lib/services/notificationService";
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
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const [unreadCount, setUnreadCount] = useState(0);

    // Get context for global state management
    const context = useNotificationContext();

    // Memoize the params to prevent unnecessary re-renders
    const stableParams = useMemo(() => params, [params]);

    const fetchNotifications = useCallback(
        async (newParams?: NotificationQueryParams) => {
            setLoading(true);
            setError(null);

            try {
                const queryParams = { ...stableParams, ...newParams };
                const response = await notificationService.getNotifications(
                    queryParams
                );

                setNotifications(response.data);
                setPagination({
                    total: response.total,
                    totalPages: response.totalPages,
                    page: response.page,
                    limit: response.limit,
                });
                setUnreadCount(response.unreadCount);

                // Sync with global context if this is the main notification view
                if (context && !newParams) {
                    context.fetchNotifications(queryParams);
                }
            } catch (err) {
                let errorMessage = "Failed to fetch notifications";

                if (err instanceof Error) {
                    if (
                        err.message.includes("network") ||
                        err.message.includes("fetch")
                    ) {
                        errorMessage =
                            "Network error. Please check your connection and try again.";
                    } else if (
                        err.message.includes("unauthorized") ||
                        err.message.includes("403")
                    ) {
                        errorMessage =
                            "You don't have permission to view notifications.";
                    } else if (err.message.includes("timeout")) {
                        errorMessage = "Request timed out. Please try again.";
                    } else {
                        errorMessage = err.message;
                    }
                }

                setError(errorMessage);
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        },
        [stableParams, context]
    );

    const refetch = useCallback(
        () => fetchNotifications(),
        [fetchNotifications]
    );

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? {
                              ...notification,
                              read: true,
                              readAt: new Date().toISOString(),
                          }
                        : notification
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read: true,
                    readAt: new Date().toISOString(),
                }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== id)
            );
            setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (pagination.page < pagination.totalPages && !loading) {
            try {
                const response = await notificationService.getNotifications({
                    ...stableParams,
                    page: pagination.page + 1,
                });

                setNotifications((prev) => [...prev, ...response.data]);
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
            } catch (err) {
                console.error("Failed to load more notifications:", err);
            }
        }
    }, [stableParams, pagination.page, pagination.totalPages, loading]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const hasMore = pagination.page < pagination.totalPages;

    return {
        notifications,
        loading,
        error,
        pagination,
        unreadCount,
        refetch,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        hasMore,
    };
}
