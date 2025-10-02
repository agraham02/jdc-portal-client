import { apiClient } from "@/lib/api";
import type {
    NotificationResponseDto,
    NotificationListResponseDto,
    NotificationQuery,
    UnreadCountResponseDto,
    CreateNotificationDto,
    BroadcastNotificationDto,
    UserPreferences,
    UpdatePreferencesDto,
} from "@/lib/types/notifications";

/**
 * Build query string from parameters, filtering out undefined/null values
 */
function buildQueryString(params: NotificationQuery): string {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) {
            search.append(k, String(v));
        }
    }
    return search.toString();
}

/**
 * User-facing notifications API
 */
export const NotificationsApi = {
    /**
     * Get user notifications with pagination and filtering
     */
    async list(
        params: NotificationQuery = {}
    ): Promise<NotificationListResponseDto> {
        const qs = buildQueryString(params);
        const path = `/notifications${qs ? `?${qs}` : ""}`;
        return apiClient.get<NotificationListResponseDto>(path);
    },

    /**
     * Get unread notification count with breakdown by type
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
     * Delete a notification (soft delete)
     */
    async remove(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/notifications/${id}`);
    },

    /**
     * Get user notification preferences
     */
    async getPreferences(): Promise<{ data: UserPreferences }> {
        return apiClient.get<{ data: UserPreferences }>(
            "/notifications/preferences"
        );
    },

    /**
     * Update user notification preferences
     */
    async updatePreferences(
        preferences: UpdatePreferencesDto
    ): Promise<{ data: UserPreferences }> {
        return apiClient.patch<{ data: UserPreferences }>(
            "/notifications/preferences",
            preferences
        );
    },
};

/**
 * Admin-only notifications API
 * Requires appropriate permissions (NOTIFICATIONS_MANAGE, NOTIFICATIONS_BROADCAST)
 */
export const AdminNotificationsApi = {
    /**
     * Create a notification for a specific user (Admin only)
     */
    async create(
        dto: CreateNotificationDto
    ): Promise<{ message: string; data: NotificationResponseDto }> {
        return apiClient.post<{
            message: string;
            data: NotificationResponseDto;
        }>("/notifications", dto);
    },

    /**
     * Broadcast system announcement to multiple users
     * Can target specific roles or all users
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
     * Get all notifications across all users (Admin only)
     * Supports filtering by userId, type, severity, etc.
     */
    async listAll(
        params: NotificationQuery = {}
    ): Promise<NotificationListResponseDto> {
        const qs = buildQueryString(params);
        return apiClient.get<NotificationListResponseDto>(
            `/notifications/admin/all${qs ? `?${qs}` : ""}`
        );
    },

    /**
     * Get a specific notification by ID (Admin only)
     */
    async getById(id: string): Promise<{ data: NotificationResponseDto }> {
        return apiClient.get<{ data: NotificationResponseDto }>(
            `/notifications/admin/${id}`
        );
    },

    /**
     * Clean up old read notifications (Admin only)
     * Helps maintain database performance
     */
    async cleanup(params?: {
        olderThanDays?: number;
        onlyRead?: boolean;
    }): Promise<{ message: string; data: { deletedCount: number } }> {
        const qs = params
            ? buildQueryString(params as unknown as NotificationQuery)
            : "";
        return apiClient.post<{
            message: string;
            data: { deletedCount: number };
        }>(`/notifications/admin/cleanup${qs ? `?${qs}` : ""}`, {});
    },
};
