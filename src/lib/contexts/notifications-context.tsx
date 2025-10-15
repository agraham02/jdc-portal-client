"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { NotificationsApi } from "@/lib/services/notifications";
import type {
    Notification,
    NotificationListResponseDto,
    NotificationQuery,
    NotificationResponseDto,
} from "@/lib/types/notifications";
import {
    NotificationType,
    NotificationSeverity,
    NotificationEmailStatus,
} from "@/lib/types/notifications";
import {
    notificationsSocket,
    type ConnectionState,
} from "@/lib/services/realtime";
import { toast } from "sonner";
import { useAuth } from "@/lib/contexts/auth-context";

const MAX_NOTIFICATIONS_IN_MEMORY = 100;
const notificationsDebug =
    process.env.NEXT_PUBLIC_DEBUG_NOTIFICATIONS === "true";

const limitNotifications = (items: Notification[]): Notification[] => {
    return [...items]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, MAX_NOTIFICATIONS_IN_MEMORY);
};

type NotificationsContextValue = {
    // State
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    connectionState: ConnectionState;
    hasMore: boolean;
    page: number;
    totalPages: number;

    // Actions
    list: (params?: NotificationQuery) => Promise<NotificationListResponseDto>;
    loadMore: () => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    remove: (id: string) => Promise<void>;
    refreshUnreadCount: () => Promise<void>;

    // Internal (for components that need direct control)
    prepend: (n: Notification) => void;
};

const NotificationsContext = createContext<
    NotificationsContextValue | undefined
>(undefined);

export function NotificationsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectionState, setConnectionState] =
        useState<ConnectionState>("disconnected");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const paramsRef = useRef<NotificationQuery>({ page: 1, limit: 20 });
    const shownToastIdsRef = useRef<Set<string>>(new Set());
    const notificationIdsRef = useRef<Set<string>>(new Set());

    // Memoize derived state to prevent unnecessary re-renders
    const isConnected = useMemo(
        () => connectionState === "connected",
        [connectionState]
    );

    // Memoize sorted notifications to avoid recalculating on every render
    const sortedNotifications = useMemo(
        () =>
            [...notifications].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            ),
        [notifications]
    );

    /**
     * Normalize backend response to client-side model
     */
    // Stable normalize function (no external dependencies)
    const normalize = useCallback(
        (dto: NotificationResponseDto | unknown): Notification => {
            const obj = (dto ?? {}) as Record<string, unknown>;
            const toIso = (d: unknown) =>
                typeof d === "string" ? d : new Date().toISOString();

            return {
                id: String(obj["id"] ?? obj["_id"] ?? ""),
                _id: obj["_id"] ? String(obj["_id"]) : undefined,
                userId: String(obj["userId"] ?? ""),
                type:
                    (obj["type"] as NotificationType) ??
                    NotificationType.SYSTEM_ANNOUNCEMENT,
                severity:
                    (obj["severity"] as NotificationSeverity) ??
                    NotificationSeverity.INFO,
                title: String(obj["title"] ?? ""),
                message: String(obj["message"] ?? ""),
                data:
                    obj["data"] && typeof obj["data"] === "object"
                        ? (obj["data"] as Record<string, unknown>)
                        : {},
                category: obj["category"] ? String(obj["category"]) : undefined,
                read: Boolean(obj["read"]),
                readAt: obj["readAt"] ? toIso(obj["readAt"]) : null,
                emailStatus:
                    (obj["emailStatus"] as NotificationEmailStatus) ??
                    NotificationEmailStatus.PENDING,
                emailedAt: obj["emailedAt"] ? toIso(obj["emailedAt"]) : null,
                createdAt: toIso(obj["createdAt"]),
                updatedAt: toIso(
                    (obj["updatedAt"] ?? obj["createdAt"]) as unknown
                ),
            };
        },
        [] // No dependencies, so reference is stable
    );

    /**
     * Fetch notifications with pagination and filters
     */
    const list = useCallback(
        async (params?: NotificationQuery) => {
            try {
                const merged = { ...paramsRef.current, ...(params || {}) };
                paramsRef.current = merged;
                setLoading(true);
                setError(null);

                const res = await NotificationsApi.list(merged);
                if (notificationsDebug) {
                    console.log("[NotificationsContext] list", res);
                }

                // Clear the deduplication set for fresh loads (page 1)
                // This ensures WebSocket notifications that arrived before
                // the list load are included in the results
                if ((merged.page ?? 1) === 1) {
                    notificationIdsRef.current.clear();
                }

                // Normalize and deduplicate
                const normalizedData = res.data
                    .map((item) => normalize(item))
                    .filter((n) => {
                        if (notificationIdsRef.current.has(n.id)) return false;
                        notificationIdsRef.current.add(n.id);
                        return true;
                    });
                if (notificationsDebug) {
                    console.log(
                        "[NotificationsContext] normalized",
                        normalizedData
                    );
                }

                setNotifications(limitNotifications(normalizedData));
                setUnreadCount(res.unreadCount ?? 0);
                setPage(res.page ?? 1);
                setTotalPages(res.totalPages ?? 1);
                setHasMore((res.page ?? 1) < (res.totalPages ?? 1));
                setLoading(false);

                return res;
            } catch (err) {
                console.error("[NotificationsContext] Failed to load:", err);
                setError("Failed to load notifications");
                setLoading(false);
                throw err;
            }
        },
        [normalize]
    );

    /**
     * Load next page of notifications
     */
    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        const nextPage = page + 1;
        setLoading(true);

        try {
            const res = await NotificationsApi.list({
                ...paramsRef.current,
                page: nextPage,
            });

            const normalizedData = res.data
                .map((item) => normalize(item))
                .filter((n) => {
                    if (notificationIdsRef.current.has(n.id)) return false;
                    notificationIdsRef.current.add(n.id);
                    return true;
                });

            setNotifications((prev) => {
                const combined = [...prev, ...normalizedData];
                // Limit memory usage to newest notifications
                return limitNotifications(combined);
            });
            setPage(res.page ?? nextPage);
            setHasMore((res.page ?? nextPage) < (res.totalPages ?? 1));
        } catch (err) {
            console.error("[NotificationsContext] Failed to load more:", err);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page, normalize]);

    /**
     * Refresh unread count from server
     */
    const refreshUnreadCount = useCallback(async () => {
        try {
            const { count } = await NotificationsApi.unreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error(
                "[NotificationsContext] Failed to refresh unread count:",
                err
            );
        }
    }, []);

    /**
     * Mark a single notification as read (optimistic update)
     */
    const markRead = useCallback(
        async (id: string) => {
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? { ...n, read: true, readAt: new Date().toISOString() }
                        : n
                )
            );
            setUnreadCount((c) => Math.max(0, c - 1));

            try {
                await NotificationsApi.markRead(id);
            } catch (err) {
                console.error(
                    "[NotificationsContext] Failed to mark as read:",
                    err
                );
                // Rollback on failure
                await list();
            }
        },
        [list]
    );

    /**
     * Mark all notifications as read (optimistic update)
     */
    const markAllRead = useCallback(async () => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => ({
                ...n,
                read: true,
                readAt: new Date().toISOString(),
            }))
        );
        setUnreadCount(0);

        try {
            await NotificationsApi.markAllRead();
        } catch (err) {
            console.error(
                "[NotificationsContext] Failed to mark all as read:",
                err
            );
            // Rollback on failure
            await list();
        }
    }, [list]);

    /**
     * Delete a notification (optimistic update)
     */
    const remove = useCallback(
        async (id: string) => {
            // Store for potential rollback
            const notification = notifications.find((n) => n.id === id);
            const wasUnread = notification && !notification.read;

            // Optimistic update
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            notificationIdsRef.current.delete(id);
            if (wasUnread) {
                setUnreadCount((c) => Math.max(0, c - 1));
            }

            try {
                await NotificationsApi.remove(id);
            } catch (err) {
                console.error("[NotificationsContext] Failed to delete:", err);
                // Rollback on failure
                await list();
            }
        },
        [notifications, list]
    );

    /**
     * Prepend a new notification to the list (for real-time updates)
     */
    // Stable prepend function (no external dependencies)
    const prepend = useCallback((n: Notification) => {
        // Deduplicate
        if (notificationIdsRef.current.has(n.id)) {
            return;
        }

        notificationIdsRef.current.add(n.id);
        setNotifications((prev) => {
            const updated = [n, ...prev];
            // Limit memory
            return limitNotifications(updated);
        });

        if (!n.read) {
            setUnreadCount((c) => c + 1);
        }
    }, []); // No dependencies, so reference is stable

    /**
     * Store stable references to callbacks for use in useEffect
     */
    const listRef = useRef(list);
    const refreshUnreadCountRef = useRef(refreshUnreadCount);
    const normalizeRef = useRef(normalize);
    const prependRef = useRef(prepend);

    // Keep refs updated with latest callbacks
    useEffect(() => {
        listRef.current = list;
        refreshUnreadCountRef.current = refreshUnreadCount;
        normalizeRef.current = normalize;
        prependRef.current = prepend;
    });

    /**
     * Setup WebSocket connection and listeners
     * Only runs once auth is ready
     */
    useEffect(() => {
        // Wait for auth to complete before initializing
        if (authLoading) {
            return;
        }

        // Only proceed if authenticated
        if (!isAuthenticated) {
            return;
        }

        // Initial data load using ref to avoid dependency issues
        listRef.current({ page: 1, limit: 20 }).catch(() => {});
        refreshUnreadCountRef.current().catch(() => {});

        // Connect to WebSocket
        notificationsSocket.connect();

        // Listen for connection state changes
        const offStateChange = notificationsSocket.onStateChange((state) => {
            setConnectionState(state);
        });

        // Listen for new notifications
        const offNew = notificationsSocket.on("notification", (payload) => {
            try {
                const n = normalizeRef.current(payload);
                prependRef.current(n);

                // Acknowledge receipt
                if (n.id) {
                    notificationsSocket.ack(n.id);
                }

                // Show toast (deduplicated)
                if (n.id && !shownToastIdsRef.current.has(n.id)) {
                    shownToastIdsRef.current.add(n.id);
                    const title = n.title || "New notification";
                    const description = n.message || undefined;

                    // Use different toast types based on severity
                    switch (n.severity) {
                        case NotificationSeverity.SUCCESS:
                            toast.success(title, { description });
                            break;
                        case NotificationSeverity.WARNING:
                            toast.warning(title, { description });
                            break;
                        case NotificationSeverity.ERROR:
                        case NotificationSeverity.CRITICAL:
                            toast.error(title, { description });
                            break;
                        default:
                            toast(title, { description });
                    }
                }
            } catch (err) {
                console.error(
                    "[NotificationsContext] Failed to handle notification:",
                    err
                );
            }
        });

        // Listen for retry events
        const offRetry = notificationsSocket.on(
            "notification:retry",
            (payload) => {
                try {
                    const n = normalizeRef.current(payload);
                    // Re-acknowledge
                    if (n.id) {
                        notificationsSocket.ack(n.id);
                    }
                } catch (err) {
                    console.error(
                        "[NotificationsContext] Failed to handle retry:",
                        err
                    );
                }
            }
        );

        // Cleanup
        return () => {
            offStateChange();
            offNew();
            offRetry();
            notificationsSocket.disconnect();
        };
    }, [authLoading, isAuthenticated]); // Re-run when auth state changes

    const value = useMemo<NotificationsContextValue>(
        () => ({
            notifications: sortedNotifications, // Use memoized sorted array
            unreadCount,
            loading,
            error,
            isConnected,
            connectionState,
            hasMore,
            page,
            totalPages,
            list,
            loadMore,
            markRead,
            markAllRead,
            remove,
            refreshUnreadCount,
            prepend,
        }),
        [
            sortedNotifications, // Use memoized value
            unreadCount,
            loading,
            error,
            isConnected,
            connectionState,
            hasMore,
            page,
            totalPages,
            list,
            loadMore,
            markRead,
            markAllRead,
            remove,
            refreshUnreadCount,
            prepend,
        ]
    );

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotificationsCtx() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) {
        throw new Error(
            "useNotificationsCtx must be used within NotificationsProvider"
        );
    }
    return ctx;
}
