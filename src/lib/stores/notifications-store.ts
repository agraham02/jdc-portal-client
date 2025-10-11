/**
 * Zustand store for notifications
 *
 * Split into multiple stores for performance optimization:
 * - useNotificationsStore: Main notifications data and state
 * - useNotificationsConnectionStore: WebSocket connection state
 * - useNotificationsActionsStore: Actions to modify notifications
 *
 * This prevents unnecessary re-renders by allowing components to subscribe
 * only to the slices of state they actually need.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { NotificationsApi } from "@/lib/services/notifications";
import {
    notificationsSocket,
    type ConnectionState,
} from "@/lib/services/realtime";
import { toast } from "sonner";
import type {
    Notification,
    NotificationListResponseDto,
    NotificationQuery,
    NotificationSeverity,
} from "@/lib/types/notifications";

const MAX_NOTIFICATIONS_IN_MEMORY = 100;

// ============================================================================
// Notifications Data Store (subscribe to this for notification list/unread count)
// ============================================================================

interface NotificationsDataState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

interface NotificationsDataActions {
    setNotifications: (notifications: Notification[]) => void;
    setUnreadCount: (count: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setPagination: (page: number, totalPages: number, hasMore: boolean) => void;
    addNotification: (notification: Notification) => void;
    updateNotification: (id: string, updates: Partial<Notification>) => void;
    removeNotification: (id: string) => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    reset: () => void;
}

const initialDataState: NotificationsDataState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    hasMore: false,
};

export const useNotificationsStore = create<
    NotificationsDataState & NotificationsDataActions
>()(
    devtools(
        (set) => ({
            ...initialDataState,

            setNotifications: (notifications) => {
                // Limit to MAX_NOTIFICATIONS_IN_MEMORY to prevent memory issues
                const limited = notifications
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    )
                    .slice(0, MAX_NOTIFICATIONS_IN_MEMORY);
                set({ notifications: limited });
            },

            setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

            setLoading: (loading) => set({ loading }),

            setError: (error) => set({ error }),

            setPagination: (page, totalPages, hasMore) =>
                set({ page, totalPages, hasMore }),

            addNotification: (notification) =>
                set((state) => {
                    // Check if notification already exists (deduplication)
                    const exists = state.notifications.some(
                        (n) => n.id === notification.id
                    );
                    if (exists) return state;

                    const updated = [notification, ...state.notifications]
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )
                        .slice(0, MAX_NOTIFICATIONS_IN_MEMORY);

                    return {
                        notifications: updated,
                        unreadCount: notification.read
                            ? state.unreadCount
                            : state.unreadCount + 1,
                    };
                }),

            updateNotification: (id, updates) =>
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, ...updates } : n
                    ),
                })),

            removeNotification: (id) =>
                set((state) => {
                    const notification = state.notifications.find(
                        (n) => n.id === id
                    );
                    return {
                        notifications: state.notifications.filter(
                            (n) => n.id !== id
                        ),
                        unreadCount: notification?.read
                            ? state.unreadCount
                            : Math.max(0, state.unreadCount - 1),
                    };
                }),

            markNotificationRead: (id) =>
                set((state) => {
                    const notification = state.notifications.find(
                        (n) => n.id === id
                    );
                    if (!notification || notification.read) return state;

                    return {
                        notifications: state.notifications.map((n) =>
                            n.id === id ? { ...n, read: true } : n
                        ),
                        unreadCount: Math.max(0, state.unreadCount - 1),
                    };
                }),

            markAllNotificationsRead: () =>
                set((state) => ({
                    notifications: state.notifications.map((n) => ({
                        ...n,
                        read: true,
                    })),
                    unreadCount: 0,
                })),

            reset: () => set(initialDataState),
        }),
        { name: "notifications-data" }
    )
);

// ============================================================================
// Connection State Store (subscribe to this for connection status only)
// ============================================================================

interface ConnectionStateStore {
    connectionState: ConnectionState;
    isConnected: boolean;
    setConnectionState: (state: ConnectionState) => void;
}

export const useNotificationsConnectionStore = create<ConnectionStateStore>()(
    devtools(
        (set) => ({
            connectionState: "disconnected",
            isConnected: false,

            setConnectionState: (connectionState) =>
                set({
                    connectionState,
                    isConnected: connectionState === "connected",
                }),
        }),
        { name: "notifications-connection" }
    )
);

// ============================================================================
// Actions Store (methods to interact with API and WebSocket)
// ============================================================================

interface NotificationsActionsStore {
    list: (params?: NotificationQuery) => Promise<NotificationListResponseDto>;
    loadMore: () => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    remove: (id: string) => Promise<void>;
    refreshUnreadCount: () => Promise<void>;
    initializeWebSocket: () => void;
    disconnectWebSocket: () => void;
}

const shownToastIds = new Set<string>();

export const useNotificationsActionsStore = create<NotificationsActionsStore>()(
    devtools(
        () => ({
            list: async (params) => {
                const store = useNotificationsStore.getState();
                store.setLoading(true);
                store.setError(null);

                try {
                    const response = await NotificationsApi.list(params);
                    // Normalize response DTOs to client Notification models
                    const normalized = response.data.map((dto) => ({
                        ...dto,
                        id: dto._id, // Normalize _id to id
                    }));
                    store.setNotifications(normalized);
                    store.setPagination(
                        response.page,
                        response.totalPages,
                        response.page < response.totalPages
                    );
                    store.setUnreadCount(response.unreadCount);
                    return response;
                } catch (err) {
                    const message =
                        err instanceof Error
                            ? err.message
                            : "Failed to load notifications";
                    store.setError(message);
                    throw err;
                } finally {
                    store.setLoading(false);
                }
            },

            loadMore: async () => {
                const store = useNotificationsStore.getState();
                if (!store.hasMore || store.loading) return;

                const nextPage = store.page + 1;
                store.setLoading(true);

                try {
                    const response = await NotificationsApi.list({
                        page: nextPage,
                        limit: 20,
                    });

                    // Normalize and append new notifications
                    const normalized: Notification[] = response.data.map(
                        (dto) => ({
                            ...dto,
                            id: dto._id,
                        })
                    );
                    const combined: Notification[] = [
                        ...store.notifications,
                        ...normalized,
                    ];
                    store.setNotifications(combined);
                    store.setPagination(
                        response.page,
                        response.totalPages,
                        response.page < response.totalPages
                    );
                } catch (err) {
                    const message =
                        err instanceof Error
                            ? err.message
                            : "Failed to load more";
                    store.setError(message);
                } finally {
                    store.setLoading(false);
                }
            },

            markRead: async (id) => {
                const store = useNotificationsStore.getState();
                // Optimistic update
                store.markNotificationRead(id);

                try {
                    await NotificationsApi.markRead(id);
                } catch (err) {
                    // Revert on error
                    console.error("[Notifications] Failed to mark read:", err);
                    toast.error("Failed to mark notification as read");
                    // Re-fetch to get correct state
                    await useNotificationsActionsStore
                        .getState()
                        .refreshUnreadCount();
                }
            },

            markAllRead: async () => {
                const store = useNotificationsStore.getState();
                // Optimistic update
                const previousState = {
                    notifications: [...store.notifications],
                    unreadCount: store.unreadCount,
                };
                store.markAllNotificationsRead();

                try {
                    await NotificationsApi.markAllRead();
                } catch (err) {
                    // Revert on error
                    console.error(
                        "[Notifications] Failed to mark all read:",
                        err
                    );
                    store.setNotifications(previousState.notifications);
                    store.setUnreadCount(previousState.unreadCount);
                    toast.error("Failed to mark all notifications as read");
                }
            },

            remove: async (id) => {
                const store = useNotificationsStore.getState();
                // Optimistic update
                const removed = store.notifications.find((n) => n.id === id);
                store.removeNotification(id);

                try {
                    await NotificationsApi.remove(id);
                } catch (err) {
                    // Revert on error
                    console.error("[Notifications] Failed to remove:", err);
                    if (removed) store.addNotification(removed);
                    toast.error("Failed to remove notification");
                }
            },

            refreshUnreadCount: async () => {
                try {
                    const response = await NotificationsApi.list({
                        page: 1,
                        limit: 1,
                    });
                    useNotificationsStore
                        .getState()
                        .setUnreadCount(response.unreadCount);
                } catch (err) {
                    console.error(
                        "[Notifications] Failed to refresh unread count:",
                        err
                    );
                }
            },

            initializeWebSocket: () => {
                const dataStore = useNotificationsStore.getState();
                const connectionStore =
                    useNotificationsConnectionStore.getState();

                // Listen to connection state changes
                notificationsSocket.onStateChange((state) => {
                    connectionStore.setConnectionState(state);
                });

                // Listen to incoming notifications
                notificationsSocket.on("notification", (notificationDto) => {
                    // Normalize DTO to client model
                    const notification: Notification = {
                        ...notificationDto,
                        id: notificationDto._id || notificationDto.id || "",
                    };

                    // Add to store
                    dataStore.addNotification(notification);

                    // Show toast notification
                    if (!shownToastIds.has(notification.id)) {
                        shownToastIds.add(notification.id);
                        const severityConfig = getSeverityConfig(
                            notification.severity
                        );
                        severityConfig.toastFn(notification.title, {
                            description: notification.message,
                        });
                    }

                    // Send acknowledgment (if socket supports it)
                    // Note: NotificationsSocketClient doesn't expose emit method
                    // The socket handles ack internally
                });

                // Connect
                notificationsSocket.connect();
            },

            disconnectWebSocket: () => {
                notificationsSocket.disconnect();
                shownToastIds.clear();
            },
        }),
        { name: "notifications-actions" }
    )
);

// ============================================================================
// Helpers
// ============================================================================

function getSeverityConfig(severity: NotificationSeverity) {
    switch (severity) {
        case "critical":
        case "error":
            return { toastFn: toast.error };
        case "warning":
            return { toastFn: toast.warning };
        case "success":
            return { toastFn: toast.success };
        case "info":
        default:
            return { toastFn: toast.info };
    }
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get only the notifications array (most common use case)
 */
export function useNotifications() {
    return useNotificationsStore((state) => state.notifications);
}

/**
 * Hook to get only the unread count (for badge in header)
 */
export function useUnreadCount() {
    return useNotificationsStore((state) => state.unreadCount);
}

/**
 * Hook to get only the connection status (for connection indicator)
 */
export function useNotificationsConnection() {
    return useNotificationsConnectionStore((state) => ({
        isConnected: state.isConnected,
        connectionState: state.connectionState,
    }));
}

/**
 * Hook to get all actions (for components that need to interact with API)
 */
export function useNotificationsActions() {
    return useNotificationsActionsStore();
}
