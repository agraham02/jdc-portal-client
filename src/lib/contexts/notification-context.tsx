"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
    useMemo,
} from "react";
import { notificationService } from "@/lib/services/notificationService";
import type {
    NotificationQueryParams,
    Notification,
} from "@/lib/types/notifications";

interface NotificationContextType {
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
    fetchNotifications: (params?: NotificationQueryParams) => Promise<void>;
    refetch: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
    lastParams: NotificationQueryParams;
    initialized: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastParams, setLastParams] = useState<NotificationQueryParams>({});
    const [initialized, setInitialized] = useState(false);
    const [abortController, setAbortController] =
        useState<AbortController | null>(null);

    const fetchNotifications = useCallback(
        async (params: NotificationQueryParams = {}) => {
            // Cancel any ongoing request
            if (abortController) {
                abortController.abort();
            }

            // Prevent multiple simultaneous calls
            if (loading) return;

            const controller = new AbortController();
            setAbortController(controller);

            setLoading(true);
            setError(null);

            try {
                const queryParams = { ...params };
                setLastParams(queryParams);

                const response = await notificationService.getNotifications(
                    queryParams
                );

                // Check if request was aborted
                if (controller.signal.aborted) {
                    return;
                }

                setNotifications(response.data);
                setPagination({
                    total: response.total,
                    totalPages: response.totalPages,
                    page: response.page,
                    limit: response.limit,
                });
                setUnreadCount(response.unreadCount);
                setInitialized(true);
            } catch (err) {
                // Don't set error if request was aborted
                if (controller.signal.aborted) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch notifications"
                );
                console.error("Notification fetch error:", err);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
                setAbortController(null);
            }
        },
        [loading, abortController]
    );

    const refetch = useCallback(() => {
        return fetchNotifications(lastParams);
    }, [fetchNotifications, lastParams]);

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

    const deleteNotification = useCallback(
        async (id: string) => {
            try {
                await notificationService.deleteNotification(id);
                setNotifications((prev) =>
                    prev.filter((notification) => notification.id !== id)
                );
                setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
                // Update unread count if the deleted notification was unread
                const deletedNotification = notifications.find(
                    (n) => n.id === id
                );
                if (deletedNotification && !deletedNotification.read) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error("Failed to delete notification:", err);
            }
        },
        [notifications]
    );

    const loadMore = useCallback(async () => {
        if (pagination.page < pagination.totalPages && !loading) {
            setLoading(true);
            try {
                const response = await notificationService.getNotifications({
                    ...lastParams,
                    page: pagination.page + 1,
                });

                setNotifications((prev) => [...prev, ...response.data]);
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
            } catch (err) {
                console.error("Failed to load more notifications:", err);
            } finally {
                setLoading(false);
            }
        }
    }, [lastParams, pagination.page, pagination.totalPages, loading]);

    // Initial load with minimal data for badge
    useEffect(() => {
        if (!initialized) {
            fetchNotifications({ limit: 5, page: 1 });
        }
    }, [fetchNotifications, initialized]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortController) {
                abortController.abort();
            }
        };
    }, [abortController]);

    const hasMore = pagination.page < pagination.totalPages;

    const contextValue = useMemo(
        () => ({
            notifications,
            loading,
            error,
            pagination,
            unreadCount,
            fetchNotifications,
            refetch,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            loadMore,
            hasMore,
            lastParams,
            initialized,
        }),
        [
            notifications,
            loading,
            error,
            pagination,
            unreadCount,
            fetchNotifications,
            refetch,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            loadMore,
            hasMore,
            lastParams,
            initialized,
        ]
    );

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext(): NotificationContextType {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotificationContext must be used within a NotificationProvider"
        );
    }
    return context;
}
