import { BaseService } from "./base";
import type { QueryParams } from "@/lib/utils/queryParams";
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
 * Unified Notifications Service
 * Handles both user-facing and admin notification operations
 * Extends BaseService for consistent HTTP patterns
 */
export class NotificationsService extends BaseService {
    private static readonly BASE_PATH = "/notifications";

    // ==================== User-facing Methods ====================

    /**
     * Get user notifications with pagination and filtering
     */
    static async list(
        params: NotificationQuery = {}
    ): Promise<NotificationListResponseDto> {
        return this.get<NotificationListResponseDto>(
            this.BASE_PATH,
            params as QueryParams
        );
    }

    /**
     * Get unread notification count with breakdown by type
     */
    static async unreadCount(): Promise<UnreadCountResponseDto> {
        return this.get<UnreadCountResponseDto>(
            `${this.BASE_PATH}/unread-count`
        );
    }

    /**
     * Mark a notification as read
     */
    static async markRead(
        id: string
    ): Promise<{ message: string; notification: NotificationResponseDto }> {
        return this.patch<{
            message: string;
            notification: NotificationResponseDto;
        }>(`${this.BASE_PATH}/${id}/read`, {});
    }

    /**
     * Mark all notifications as read
     */
    static async markAllRead(): Promise<{
        message: string;
        modifiedCount: number;
    }> {
        return this.patch<{ message: string; modifiedCount: number }>(
            `${this.BASE_PATH}/mark-all-read`,
            {}
        );
    }

    /**
     * Delete a notification (soft delete)
     */
    static async remove(id: string): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`${this.BASE_PATH}/${id}`);
    }

    /**
     * Get user notification preferences
     */
    static async getPreferences(): Promise<{ data: UserPreferences }> {
        return this.get<{ data: UserPreferences }>(
            `${this.BASE_PATH}/preferences`
        );
    }

    /**
     * Update user notification preferences
     */
    static async updatePreferences(
        preferences: UpdatePreferencesDto
    ): Promise<{ data: UserPreferences }> {
        return this.patch<{ data: UserPreferences }>(
            `${this.BASE_PATH}/preferences`,
            preferences
        );
    }

    // ==================== Admin-only Methods ====================

    /**
     * Create a notification for a specific user (Admin only)
     * Requires NOTIFICATIONS_MANAGE permission
     */
    static async create(
        dto: CreateNotificationDto
    ): Promise<{ message: string; data: NotificationResponseDto }> {
        return this.post<{
            message: string;
            data: NotificationResponseDto;
        }>(this.BASE_PATH, dto);
    }

    /**
     * Broadcast system announcement to multiple users
     * Can target specific roles or all users
     * Requires NOTIFICATIONS_BROADCAST permission
     */
    static async broadcast(dto: BroadcastNotificationDto): Promise<{
        message: string;
        data: { notificationsSent: number; targetRoles?: string[] };
    }> {
        return this.post<{
            message: string;
            data: { notificationsSent: number; targetRoles?: string[] };
        }>(`${this.BASE_PATH}/broadcast`, dto);
    }

    /**
     * Get all notifications across all users (Admin only)
     * Supports filtering by userId, type, severity, etc.
     * Requires NOTIFICATIONS_MANAGE permission
     */
    static async listAll(
        params: NotificationQuery = {}
    ): Promise<NotificationListResponseDto> {
        return this.get<NotificationListResponseDto>(
            `${this.BASE_PATH}/admin/all`,
            params as QueryParams
        );
    }

    /**
     * Get a specific notification by ID (Admin only)
     * Requires NOTIFICATIONS_MANAGE permission
     */
    static async getById(
        id: string
    ): Promise<{ data: NotificationResponseDto }> {
        return this.get<{ data: NotificationResponseDto }>(
            `${this.BASE_PATH}/admin/${id}`
        );
    }

    /**
     * Clean up old read notifications (Admin only)
     * Helps maintain database performance
     * Requires NOTIFICATIONS_MANAGE permission
     */
    static async cleanup(params?: {
        olderThanDays?: number;
        onlyRead?: boolean;
    }): Promise<{ message: string; data: { deletedCount: number } }> {
        const path = this.buildPath(
            `${this.BASE_PATH}/admin/cleanup`,
            params as QueryParams | undefined
        );
        return this.post<{
            message: string;
            data: { deletedCount: number };
        }>(path, {});
    }
}

// ==================== Backward Compatibility ====================

/**
 * @deprecated Use NotificationsService instead
 * Maintained for backward compatibility
 */
export const NotificationsApi = NotificationsService;

/**
 * @deprecated Use NotificationsService instead
 * Maintained for backward compatibility
 */
export const AdminNotificationsApi = NotificationsService;
