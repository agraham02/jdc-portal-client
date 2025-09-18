import { apiClient } from "@/lib/api";
import type {
    NotificationResponseDto,
    NotificationListResponseDto,
    NotificationQuery,
    UnreadCountResponseDto,
    CreateNotificationDto,
    BroadcastNotificationDto,
    NotificationPreferencesDto,
    NotificationPreferencesResponseDto,
} from "@/lib/types/notifications";

export const NotificationsApi = {
    /**
     * Get user notifications with pagination and filtering
     */
    async list(
        params: NotificationQuery = {}
    ): Promise<NotificationListResponseDto> {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) search.append(k, String(v));
        }
        const qs = search.toString();
        const path = `/notifications${qs ? `?${qs}` : ""}`;
        return apiClient.get<NotificationListResponseDto>(path);
    },

    /**
     * Get unread notification count
     */
    async unreadCount(): Promise<UnreadCountResponseDto> {
        return apiClient.get<UnreadCountResponseDto>(
            "/notifications/unread-count"
        );
    },

    /**
     * Mark a notification as read
     */
    async markRead(
        id: string
    ): Promise<{ message: string; notification: NotificationResponseDto }> {
        return apiClient.patch<{
            message: string;
            notification: NotificationResponseDto;
        }>(`/notifications/${id}/read`);
    },

    /**
     * Mark all notifications as read
     */
    async markAllRead(): Promise<{ message: string; modifiedCount: number }> {
        return apiClient.patch<{ message: string; modifiedCount: number }>(
            "/notifications/mark-all-read"
        );
    },

    /**
     * Delete a notification
     */
    async remove(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/notifications/${id}`);
    },

    /**
     * Get notification preferences
     */
    async getPreferences(): Promise<NotificationPreferencesResponseDto> {
        return apiClient.get<NotificationPreferencesResponseDto>(
            "/notifications/preferences"
        );
    },

    /**
     * Update notification preferences
     */
    async updatePreferences(
        preferences: NotificationPreferencesDto
    ): Promise<NotificationPreferencesResponseDto> {
        return apiClient.patch<NotificationPreferencesResponseDto>(
            "/notifications/preferences",
            preferences
        );
    },
};

// Admin endpoints for managing notifications
export const AdminNotificationsApi = {
    /**
     * Create a notification (Admin only)
     */
    async create(
        dto: CreateNotificationDto
    ): Promise<{ message: string; notification: NotificationResponseDto }> {
        return apiClient.post<{
            message: string;
            notification: NotificationResponseDto;
        }>("/notifications", dto);
    },

    /**
     * Broadcast system announcement to multiple users
     */
    async broadcast(dto: BroadcastNotificationDto): Promise<{
        message: string;
        data: { notificationsSent: number; targetRoles?: string[] };
    }> {
        return apiClient.post<{
            message: string;
            data: { notificationsSent: number; targetRoles?: string[] };
        }>("/notifications/broadcast", dto);
    },

    /**
     * Get all notifications (Admin only)
     */
    async listAll(
        params: NotificationQuery & { userId?: string } = {}
    ): Promise<NotificationListResponseDto> {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) search.append(k, String(v));
        }
        const qs = search.toString();
        return apiClient.get<NotificationListResponseDto>(
            `/notifications/admin/all${qs ? `?${qs}` : ""}`
        );
    },

    /**
     * Get notification by ID (Admin only)
     */
    async getById(id: string): Promise<NotificationResponseDto> {
        return apiClient.get<NotificationResponseDto>(
            `/notifications/admin/${id}`
        );
    },

    /**
     * Clean up old notifications (Admin only)
     */
    async cleanup(params?: {
        olderThanDays?: number;
        onlyRead?: boolean;
    }): Promise<{ message: string; deletedCount: number }> {
        const search = new URLSearchParams();
        if (params?.olderThanDays)
            search.append("olderThanDays", params.olderThanDays.toString());
        if (params?.onlyRead)
            search.append("onlyRead", params.onlyRead.toString());

        const qs = search.toString();
        return apiClient.post<{ message: string; deletedCount: number }>(
            `/notifications/admin/cleanup${qs ? `?${qs}` : ""}`,
            {}
        );
    },
};
