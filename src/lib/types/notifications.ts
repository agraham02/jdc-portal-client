import { PaginatedResponse } from "./api";

export enum NotificationType {
    APPLICATION_SUBMITTED = "application_submitted",
    APPLICATION_ACCEPTED = "application_accepted",
    APPLICATION_REJECTED = "application_rejected",
    CONTRACT_AWARDED = "contract_awarded",
    CONTRACT_CREATED = "contract_created",
    CONTRACT_DEADLINE_APPROACHING = "contract_deadline_approaching",
    EMPLOYEE_APPROVED = "employee_approved",
    EMPLOYEE_REJECTED = "employee_rejected",
    VENDOR_APPROVED = "vendor_approved",
    VENDOR_REJECTED = "vendor_rejected",
    FILE_UPLOADED = "file_uploaded",
    FILE_APPROVED = "file_approved",
    FILE_REJECTED = "file_rejected",
    SYSTEM_ANNOUNCEMENT = "system_announcement",
    HR_DOCUMENT_UPLOADED = "hr_document_uploaded",
    ACCOUNT_APPROVED = "account_approved",
    ACCOUNT_REJECTED = "account_rejected",
}

export enum NotificationPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent",
}

export interface Notification {
    id: string; // Normalized client-side ID from _id
    _id?: string; // Original MongoDB ID for compatibility
    userId: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    readAt?: string | null;
    deleted?: boolean;
    deletedAt?: string | null;
    expiresAt?: string;
    emailSent?: boolean;
    emailSentAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponseDto {
    _id: string;
    userId: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationListResponseDto
    extends PaginatedResponse<NotificationResponseDto> {
    unreadCount: number;
}

export interface UnreadCountResponseDto {
    count: number;
    byType: Record<NotificationType, number>;
}

export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    expiresAt?: string;
    sendEmail?: boolean;
}

export interface BroadcastNotificationDto {
    title: string;
    message: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    targetRoles?: string[];
    data?: Record<string, unknown>;
    expiresAt?: string;
    sendEmail?: boolean;
}

export interface NotificationPreferencesDto {
    emailEnabled: boolean;
    categories: Record<
        NotificationType,
        {
            enabled: boolean;
            emailEnabled: boolean;
        }
    >;
}

export interface NotificationPreferencesResponseDto {
    userId: string;
    emailEnabled: boolean;
    categories: Record<
        NotificationType,
        {
            enabled: boolean;
            emailEnabled: boolean;
        }
    >;
    updatedAt: string;
}

export interface NotificationQuery {
    page?: number;
    pageSize?: number;
    type?: NotificationType;
    priority?: NotificationPriority;
    read?: boolean;
    search?: string;
    startDate?: string;
    endDate?: string;
}
