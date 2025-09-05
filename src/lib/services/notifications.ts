import { apiClient } from "@/lib/api";
import type {
    Notification,
    NotificationListResponse,
    NotificationQuery,
    UnreadCountResponse,
} from "@/lib/types/notifications";

export const NotificationsApi = {
    async list(params: NotificationQuery = {}) {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) search.append(k, String(v));
        }
        const qs = search.toString();
        const path = `/notifications${qs ? `?${qs}` : ""}`;
        return apiClient.get<NotificationListResponse>(path);
    },
    async unreadCount() {
        return apiClient.get<UnreadCountResponse>(
            "/notifications/unread-count"
        );
    },
    async markRead(id: string) {
        return apiClient.patch<{ message: string; data: Notification }>(
            `/notifications/${id}/read`
        );
    },
    async markAllRead() {
        return apiClient.patch<{ message: string; modifiedCount: number }>(
            "/notifications/mark-all-read"
        );
    },
    async remove(id: string) {
        return apiClient.delete<void>(`/notifications/${id}`);
    },
};

// Admin endpoints for broadcasts and querying all notifications
export type BroadcastNotificationDto = {
    title: string;
    message: string;
    targetRoles?: string[];
};

export const AdminNotificationsApi = {
    async broadcast(dto: BroadcastNotificationDto) {
        return apiClient.post<{
            message: string;
            data: { notificationsSent: number; targetRoles?: string[] };
        }>("/notifications/broadcast", dto);
    },
    async listAll(params: NotificationQuery & { userId?: string } = {}) {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) search.append(k, String(v));
        }
        const qs = search.toString();
        return apiClient.get<NotificationListResponse>(
            `/notifications/admin/all${qs ? `?${qs}` : ""}`
        );
    },
};
