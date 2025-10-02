"use client";

import { io, Socket } from "socket.io-client";
import { session } from "@/lib/session";
import type { Notification } from "@/lib/types/notifications";

const socketDebug = process.env.NEXT_PUBLIC_DEBUG_SOCKET === "true";

const debugLog = (...args: Parameters<typeof console.log>) => {
    if (socketDebug) {
        console.log(...args);
    }
};

const debugWarn = (...args: Parameters<typeof console.warn>) => {
    if (socketDebug) {
        console.warn(...args);
    }
};

const debugInfo = (...args: Parameters<typeof console.debug>) => {
    if (socketDebug) {
        console.debug(...args);
    }
};

/**
 * WebSocket event types from the backend
 * Backend events: notification, notification:retry, notification:ack:ok, pong
 */
export type NotificationSocketEvents = {
    notification: (payload: Notification) => void;
    "notification:retry": (payload: Notification) => void;
    "notification:ack:ok": (payload: { notificationId: string }) => void;
    pong: (payload: { ok: boolean; ts: number; echo?: unknown }) => void;
};

type Listener<T> = (data: T) => void;

export type ConnectionState =
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting"
    | "failed";

/**
 * Enhanced WebSocket client for real-time notifications
 * Features:
 * - Automatic reconnection with exponential backoff and jitter
 * - Token refresh on 401/expired
 * - Connection state tracking
 * - Typed event listeners
 * - Graceful degradation
 */
export class NotificationsSocketClient {
    private socket: Socket | null = null;
    private attempt = 0;
    private readonly maxAttempts = 15; // ~10 minutes with backoff
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private state: ConnectionState = "disconnected";
    private listeners: Partial<{
        [K in keyof NotificationSocketEvents]: Set<Listener<unknown>>;
    }> = {};
    private stateListeners = new Set<(state: ConnectionState) => void>();
    private isIntentionalDisconnect = false;

    /**
     * Get current connection state
     */
    getState(): ConnectionState {
        return this.state;
    }

    /**
     * Check if currently connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Listen for connection state changes
     */
    onStateChange(listener: (state: ConnectionState) => void): () => void {
        this.stateListeners.add(listener);
        return () => this.stateListeners.delete(listener);
    }

    private setState(newState: ConnectionState) {
        if (this.state === newState) return;
        this.state = newState;
        for (const listener of this.stateListeners) {
            listener(newState);
        }
    }

    /**
     * Connect to the WebSocket server
     */
    connect() {
        if (this.socket?.connected) {
            return;
        }

        // Clear any pending reconnect
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        const token = session.getAccessToken();
        if (!token) {
            debugWarn(
                "[NotificationsSocket] No access token available, skipping connection"
            );
            this.setState("failed");
            return;
        }

        // Derive WebSocket URL from env or API URL
        const apiBase =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const derived = apiBase.replace(/\/?api\/?$/, "");
        const baseUrl =
            process.env.NEXT_PUBLIC_WS_URL ||
            derived ||
            "http://localhost:4000";

        this.setState("connecting");
        this.isIntentionalDisconnect = false;

        this.socket = io(`${baseUrl}/notifications`, {
            transports: ["websocket", "polling"], // Fallback to polling if WebSocket fails
            autoConnect: true,
            reconnection: false, // We handle reconnection manually
            auth: { token: `Bearer ${token}` },
            withCredentials: true,
            timeout: 10000, // 10 second connection timeout
        });

        this.setupEventHandlers();
    }

    /**
     * Disconnect from the server (intentional)
     */
    disconnect() {
        this.isIntentionalDisconnect = true;
        this.attempt = 0;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }

        this.socket?.disconnect();
        this.socket = null;
        this.setState("disconnected");
    }

    /**
     * Setup all Socket.IO event handlers
     */
    private setupEventHandlers() {
        if (!this.socket) return;

        const s = this.socket;

        // Connection successful
        s.on("connect", () => {
            debugLog("[NotificationsSocket] Connected");
            this.attempt = 0;
            this.setState("connected");
            this.startHealthCheck();
        });

        // Connection error (before connect event)
        s.on("connect_error", (error) => {
            console.error(
                "[NotificationsSocket] Connection error:",
                error.message
            );

            // Handle JWT expiration
            if (
                error.message.includes("jwt") ||
                error.message.includes("Unauthorized")
            ) {
                debugWarn("[NotificationsSocket] Token expired or invalid");
                // The auth context will handle refresh, we just need to reconnect after
            }

            this.handleDisconnect("connect_error");
        });

        // Disconnected
        s.on("disconnect", (reason) => {
            debugLog("[NotificationsSocket] Disconnected:", reason);
            this.stopHealthCheck();

            // Only reconnect if not intentional
            if (!this.isIntentionalDisconnect) {
                this.handleDisconnect(reason);
            } else {
                this.setState("disconnected");
            }
        });

        // Wire up notification events to local listeners
        s.on("notification", (payload: unknown) => {
            this.emitLocal("notification", payload);
        });

        s.on("notification:retry", (payload: unknown) => {
            debugWarn("[NotificationsSocket] Retry event received");
            this.emitLocal("notification:retry", payload);
        });

        s.on("notification:ack:ok", (payload: { notificationId: string }) => {
            this.emitLocal("notification:ack:ok", payload);
        });

        s.on("pong", (payload: { ok: boolean; ts: number; echo?: unknown }) => {
            const latency = Date.now() - payload.ts;
            debugInfo(`[NotificationsSocket] Pong received (${latency}ms)`);
            this.emitLocal("pong", payload);
        });
    }

    /**
     * Handle disconnection and schedule reconnect with exponential backoff
     */
    private handleDisconnect(reason: string) {
        // Don't reconnect if we've reached max attempts
        if (this.attempt >= this.maxAttempts) {
            console.error(
                "[NotificationsSocket] Max reconnection attempts reached"
            );
            this.setState("failed");
            return;
        }

        // Server kicked us - might be rate limit or other issue
        if (reason === "io server disconnect") {
            debugWarn("[NotificationsSocket] Server forcibly disconnected");
        }

        this.setState("reconnecting");
        this.scheduleReconnect();
    }

    /**
     * Schedule a reconnection attempt with exponential backoff and jitter
     */
    private scheduleReconnect() {
        const base = 1000; // Start at 1 second
        const max = 60000; // Max 60 seconds
        const jitter = Math.random() * 1000; // Up to 1 second jitter
        const delay = Math.min(base * 2 ** this.attempt + jitter, max);

        this.attempt++;

        debugLog(
            `[NotificationsSocket] Reconnecting in ${Math.round(
                delay / 1000
            )}s (attempt ${this.attempt}/${this.maxAttempts})`
        );

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.reconnect();
        }, delay);
    }

    /**
     * Attempt to reconnect with a fresh token
     */
    private reconnect() {
        // Get fresh token
        const token = session.getAccessToken();
        if (!token) {
            debugWarn("[NotificationsSocket] No token for reconnect");
            // Retry after a delay
            if (this.attempt < this.maxAttempts) {
                this.scheduleReconnect();
            } else {
                this.setState("failed");
            }
            return;
        }

        // Update auth and reconnect
        if (this.socket) {
            this.socket.auth = { token: `Bearer ${token}` };
            this.socket.connect();
        } else {
            // Socket was destroyed, create a new one
            this.connect();
        }
    }

    /**
     * Start periodic health checks (ping/pong)
     */
    private startHealthCheck() {
        if (this.healthCheckInterval) return;

        this.healthCheckInterval = setInterval(() => {
            if (this.socket?.connected) {
                this.ping({ ts: Date.now() });
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Stop health checks
     */
    private stopHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    /**
     * Register an event listener
     * Returns an unsubscribe function
     */
    on<K extends keyof NotificationSocketEvents>(
        event: K,
        listener: Listener<Parameters<NotificationSocketEvents[K]>[0]>
    ): () => void {
        const set = (this.listeners[event] ||= new Set());
        set.add(listener as Listener<unknown>);

        // Also register with socket if connected
        this.socket?.on(
            event as string,
            listener as unknown as (...args: unknown[]) => void
        );

        return () => this.off(event, listener);
    }

    /**
     * Unregister an event listener
     */
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

    /**
     * Emit event to local listeners
     */
    private emitLocal(event: keyof NotificationSocketEvents, payload: unknown) {
        const set = this.listeners[event];
        if (!set) return;
        for (const listener of set) {
            listener(payload);
        }
    }

    /**
     * Acknowledge notification receipt
     */
    ack(notificationId: string) {
        if (!this.socket?.connected) {
            debugWarn("[NotificationsSocket] Cannot ack - not connected");
            return;
        }
        this.socket.emit("notification:ack", { notificationId });
    }

    /**
     * Send ping for health check
     */
    ping(data?: Record<string, unknown>) {
        if (!this.socket?.connected) return;
        this.socket.emit("ping", data ?? { ts: Date.now() });
    }
}

/**
 * Singleton instance for global use
 */
export const notificationsSocket = new NotificationsSocketClient();
