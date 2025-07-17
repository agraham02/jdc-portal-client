/**
 * Core notification types matching backend enums
 */
export enum NotificationType {
    APPLICATION_SUBMITTED = "ApplicationSubmitted",
    APPLICATION_ACCEPTED = "ApplicationAccepted",
    APPLICATION_REJECTED = "ApplicationRejected",
    CONTRACT_AWARDED = "ContractAwarded",
    CONTRACT_CREATED = "ContractCreated",
    CONTRACT_DEADLINE_APPROACHING = "ContractDeadlineApproaching",
    EMPLOYEE_APPROVED = "EmployeeApproved",
    EMPLOYEE_REJECTED = "EmployeeRejected",
    VENDOR_APPROVED = "VendorApproved",
    VENDOR_REJECTED = "VendorRejected",
    FILE_UPLOADED = "FileUploaded",
    FILE_APPROVED = "FileApproved",
    FILE_REJECTED = "FileRejected",
    SYSTEM_ANNOUNCEMENT = "SystemAnnouncement",
}

/**
 * Priority levels for notifications
 */
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

/**
 * Main notification interface
 */
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown>;
    read: boolean;
    readAt: string | null;
    deleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * API response for notification lists
 */
export interface NotificationListResponse {
    data: Notification[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    unreadCount: number;
}

/**
 * API response for unread count
 */
export interface UnreadCountResponse {
    count: number;
}

/**
 * Query parameters for fetching notifications
 */
export interface NotificationQueryParams {
    page?: number;
    limit?: number;
    type?: NotificationType;
    read?: boolean;
    search?: string;
}

/**
 * DTO for creating notifications (admin only)
 */
export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
}

/**
 * API error response
 */
export interface ApiError {
    statusCode: number;
    message: string | string[];
    error: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}
