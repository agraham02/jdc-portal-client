import { apiClient } from "@/lib/api";
import type {
    Notification,
    NotificationListResponse,
    UnreadCountResponse,
    NotificationQueryParams,
    CreateNotificationDto,
} from "@/lib/types/notifications";

class NotificationService {
    /**
     * Helper function to build URL with query parameters
     */
    private buildUrlWithParams(
        baseUrl: string,
        params: NotificationQueryParams = {}
    ): string {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
    }

    /**
     * Get user notifications with pagination and filtering
     */
    async getNotifications(
        params: NotificationQueryParams = {}
    ): Promise<NotificationListResponse> {
        const endpoint = this.buildUrlWithParams(
            API_CONFIG.ENDPOINTS.NOTIFICATIONS,
            params
        );

        return apiClient.get<NotificationListResponse>(endpoint);
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<UnreadCountResponse> {
        return apiClient.get<UnreadCountResponse>(
            API_CONFIG.ENDPOINTS.UNREAD_COUNT
        );
    }

    /**
     * Mark specific notification as read
     */
    async markAsRead(notificationId: string): Promise<{ message: string }> {
        const endpoint = API_CONFIG.ENDPOINTS.MARK_READ.replace(
            ":id",
            notificationId
        );
        return apiClient.patch<{ message: string }>(endpoint, {});
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<{ modifiedCount: number }> {
        return apiClient.patch<{ modifiedCount: number }>(
            API_CONFIG.ENDPOINTS.MARK_ALL_READ,
            {}
        );
    }

    /**
     * Delete notification (soft delete)
     */
    async deleteNotification(
        notificationId: string
    ): Promise<{ message: string }> {
        const endpoint = API_CONFIG.ENDPOINTS.DELETE.replace(
            ":id",
            notificationId
        );
        return apiClient.delete<{ message: string }>(endpoint);
    }

    /**
     * Create notification (admin only)
     */
    async createNotification(
        notification: CreateNotificationDto
    ): Promise<Notification> {
        return apiClient.post<Notification>(
            API_CONFIG.ENDPOINTS.ADMIN_CREATE,
            notification
        );
    }

    /**
     * Get all notifications (admin only)
     */
    async getAllNotifications(
        params: NotificationQueryParams = {}
    ): Promise<NotificationListResponse> {
        const endpoint = this.buildUrlWithParams(
            API_CONFIG.ENDPOINTS.ADMIN_ALL,
            params
        );

        return apiClient.get<NotificationListResponse>(endpoint);
    }

    /**
     * Cleanup old notifications (admin only)
     */
    async cleanupOldNotifications(
        olderThanDays: number = 90
    ): Promise<{ deletedCount: number }> {
        return apiClient.post<{ deletedCount: number }>(
            API_CONFIG.ENDPOINTS.ADMIN_CLEANUP,
            { olderThanDays }
        );
    }
}

export const notificationService = new NotificationService();
