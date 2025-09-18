"use client";

import { io, Socket } from "socket.io-client";
import { session } from "@/lib/session";

export type NotificationSocketEvents = {
    notification: (payload: unknown) => void;
    "notification:retry": (payload: { id?: string } | unknown) => void;
    "notification:ack:ok": (payload: { notificationId: string }) => void;
    pong: (payload: { ok: boolean; ts: number; echo?: unknown }) => void;
};

type Listener<T> = (data: T) => void;

export class NotificationsSocketClient {
    private socket: Socket | null = null;
    private attempt = 0;
    private readonly maxAttempts = 12; // ~ few minutes with backoff
    private listeners: Partial<{
        [K in keyof NotificationSocketEvents]: Set<Listener<unknown>>;
    }> = {};

    connect() {
        if (this.socket && this.socket.connected) return;
        // Prefer explicit WS URL; else derive from API URL (strip trailing /api)
        const apiBase =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        // Remove /api suffix if present to get the base server URL
        const derived = apiBase.replace(/\/?api\/?$/, "");
        const baseUrl =
            process.env.NEXT_PUBLIC_WS_URL ||
            derived ||
            "http://localhost:4000";

        const token = session.getAccessToken();
        this.socket = io(baseUrl + "/notifications", {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: false, // we'll implement our own with jitter
            auth: token ? { token: `Bearer ${token}` } : undefined,
            withCredentials: true,
        });

        const s = this.socket;
        s.on("connect", () => {
            this.attempt = 0;
        });
        s.on("disconnect", () => {
            this.scheduleReconnect();
        });
        s.on("connect_error", () => {
            this.scheduleReconnect();
        });

        // Wire generic forwarding to registered listeners
        s.on("notification", (p: unknown) => this.emitLocal("notification", p));
        s.on("notification:retry", (p: unknown) =>
            this.emitLocal("notification:retry", p)
        );
        s.on("notification:ack:ok", (p: { notificationId: string }) =>
            this.emitLocal("notification:ack:ok", p)
        );
        s.on("pong", (p: { ok: boolean; ts: number; echo?: unknown }) =>
            this.emitLocal("pong", p)
        );
    }

    private scheduleReconnect() {
        if (this.attempt >= this.maxAttempts) return;
        const base = 500; // ms
        const max = 30_000; // 30s
        const jitter = Math.random() * 1000;
        const delay = Math.min(base * 2 ** this.attempt + jitter, max);
        this.attempt++;
        setTimeout(() => this.reconnect(), delay);
    }

    private reconnect() {
        // Refresh token if available
        const token = session.getAccessToken();
        const s = this.socket;
        if (!s) return this.connect();
        s.auth = token ? { token: `Bearer ${token}` } : {};
        s.connect();
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }

    on<K extends keyof NotificationSocketEvents>(
        event: K,
        listener: Listener<Parameters<NotificationSocketEvents[K]>[0]>
    ) {
        const set = (this.listeners[event] ||= new Set());
        set.add(listener as Listener<unknown>);
        // Socket.IO type defs are permissive; cast through unknown to avoid any
        this.socket?.on(
            event as string,
            listener as unknown as (...args: unknown[]) => void
        );
        return () => this.off(event, listener);
    }

    off<K extends keyof NotificationSocketEvents>(
        event: K,
        listener: Listener<Parameters<NotificationSocketEvents[K]>[0]>
    ) {
        this.listeners[event]?.delete(listener as Listener<unknown>);
        this.socket?.off(
            event as string,
            listener as unknown as (...args: unknown[]) => void
        );
    }

    private emitLocal(event: keyof NotificationSocketEvents, payload: unknown) {
        const set = this.listeners[event];
        if (!set) return;
        for (const l of set) l(payload);
    }

    ack(notificationId: string) {
        this.socket?.emit("notification:ack", { notificationId });
    }

    ping(data?: Record<string, unknown>) {
        this.socket?.emit("ping", data ?? {});
    }
}

export const notificationsSocket = new NotificationsSocketClient();
