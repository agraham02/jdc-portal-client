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
    NotificationListResponse,
    NotificationQuery,
} from "@/lib/types/notifications";
import { NotificationType } from "@/lib/types/notifications";
import { notificationsSocket } from "@/lib/services/realtime";
import { toast } from "sonner";

type NotificationsContextValue = {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    list: (params?: NotificationQuery) => Promise<NotificationListResponse>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    remove: (id: string) => Promise<void>;
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
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const paramsRef = useRef<NotificationQuery>({ page: 1, limit: 25 });
    const shownToastIdsRef = useRef<Set<string>>(new Set());

    const list = useCallback(async (params?: NotificationQuery) => {
        const merged = { ...paramsRef.current, ...(params || {}) };
        paramsRef.current = merged;
        setLoading(true);
        setError(null);
        const res = await NotificationsApi.list(merged);
        setNotifications(res.data);
        if (typeof res.unreadCount === "number")
            setUnreadCount(res.unreadCount);
        setLoading(false);
        return res;
    }, []);

    const refreshUnread = useCallback(async () => {
        try {
            const { count } = await NotificationsApi.unreadCount();
            setUnreadCount(count);
        } catch {}
    }, []);

    const markRead = useCallback(
        async (id: string) => {
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
            } catch {
                // rollback on failure
                await list();
            }
        },
        [list]
    );

    const markAllRead = useCallback(async () => {
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
        } catch {
            await list();
        }
    }, [list]);

    const remove = useCallback(
        async (id: string) => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            try {
                await NotificationsApi.remove(id);
            } catch {
                await list();
            }
        },
        [list]
    );

    const prepend = useCallback((n: Notification) => {
        setNotifications((prev) => [n, ...prev]);
        if (!n.read) setUnreadCount((c) => c + 1);
    }, []);

    // Initial load and socket wiring
    useEffect(() => {
        list({ page: 1, limit: 25 }).catch(() => {});
        refreshUnread().catch(() => {});

        notificationsSocket.connect();
        const offNew = notificationsSocket.on(
            "notification",
            (payload: unknown) => {
                try {
                    const n = normalize(payload);
                    prepend(n);
                    // client ack right away
                    if (n.id) notificationsSocket.ack(n.id);

                    // toast once per id to avoid duplicates on retry/reconnect
                    const id = n.id;
                    if (id && !shownToastIdsRef.current.has(id)) {
                        shownToastIdsRef.current.add(id);
                        const title = n.title || "New notification";
                        const description = n.message || undefined;
                        toast(title, { description });
                    }
                } catch {
                    // ignore malformed payloads
                }
            }
        );
        const offRetry = notificationsSocket.on(
            "notification:retry",
            (payload: unknown) => {
                const p = payload as { id?: string } | undefined;
                const id = p && typeof p.id === "string" ? p.id : null;
                if (id) notificationsSocket.ack(id);
            }
        );

        return () => {
            offNew();
            offRetry();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo(
        () => ({
            notifications,
            unreadCount,
            loading,
            error,
            list,
            markRead,
            markAllRead,
            remove,
            prepend,
        }),
        [
            notifications,
            unreadCount,
            loading,
            error,
            list,
            markRead,
            markAllRead,
            remove,
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
    if (!ctx)
        throw new Error(
            "useNotificationsCtx must be used within NotificationsProvider"
        );
    return ctx;
}

function normalize(payload: unknown): Notification {
    const obj = (payload ?? {}) as Record<string, unknown>;
    const toIso = (d: unknown) =>
        typeof d === "string" ? d : new Date().toISOString();
    return {
        id: String((obj["id"] ?? obj["_id"] ?? "") as string),
        userId: String((obj["userId"] ?? "") as string),
        type:
            (obj["type"] as NotificationType) ??
            NotificationType.SYSTEM_ANNOUNCEMENT,
        title: String((obj["title"] ?? "") as string),
        message: String((obj["message"] ?? "") as string),
        data:
            obj["data"] && typeof obj["data"] === "object"
                ? (obj["data"] as Record<string, unknown>)
                : {},
        read: Boolean(obj["read"]),
        readAt: obj["readAt"] ? toIso(obj["readAt"]) : null,
        createdAt: toIso(obj["createdAt"]),
        updatedAt: toIso((obj["updatedAt"] ?? obj["createdAt"]) as unknown),
    } as Notification;
}
