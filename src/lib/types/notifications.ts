import type { QueryValue } from "@/lib/utils/queryParams";
import { PaginatedResponse } from "./api";

/**
 * Notification types - aligned with backend schema
 * Backend uses PascalCase for event types
 */
export enum NotificationType {
    APPLICATION_SUBMITTED = "ApplicationSubmitted",
    APPLICATION_ACCEPTED = "ApplicationAccepted",
    APPLICATION_REJECTED = "ApplicationRejected",
    APPLICATION_WITHDRAWN = "ApplicationWithdrawn",
    APPLICATION_CANCELLED = "ApplicationCancelled",
    CONTRACT_AWARDED = "ContractAwarded",
    CONTRACT_CREATED = "ContractCreated",
    CONTRACT_UPDATED = "ContractUpdated",
    CONTRACT_PUBLISHED = "ContractPublished",
    CONTRACT_DEADLINE_APPROACHING = "ContractDeadlineApproaching",
    CONTRACT_DOCUMENT_UPLOADED = "ContractDocumentUploaded",
    EMPLOYEE_APPROVED = "EmployeeApproved",
    EMPLOYEE_REJECTED = "EmployeeRejected",
    USER_ROLES_CHANGED = "UserRolesChanged",
    VENDOR_REGISTERED = "VendorRegistered",
    VENDOR_APPROVED = "VendorApproved",
    VENDOR_REJECTED = "VendorRejected",
    VENDOR_SUSPENDED = "VendorSuspended",
    FILE_UPLOADED = "FileUploaded",
    FILE_APPROVED = "FileApproved",
    FILE_REJECTED = "FileRejected",
    BILLING_FAILED = "BillingFailed",
    SYSTEM_THRESHOLD_WARNING = "SystemThresholdWarning",
    SYSTEM_ANNOUNCEMENT = "SystemAnnouncement",
}

/**
 * Notification severity/priority levels
 */
export enum NotificationSeverity {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical",
}

/**
 * Email delivery status
 */
export enum NotificationEmailStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed",
    SKIPPED = "skipped",
}

/**
 * Legacy priority enum - kept for backward compatibility
 * @deprecated Use NotificationSeverity instead
 */
export enum NotificationPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent",
}

/**
 * Client-side notification model - normalized from backend response
 */
export interface Notification {
    id: string; // Normalized client-side ID from _id
    _id?: string; // Original MongoDB ID for compatibility
    userId: string;
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    category?: string;
    read: boolean;
    readAt?: string | null;
    emailStatus: NotificationEmailStatus;
    emailedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    // Legacy fields for backward compatibility
    priority?: NotificationPriority;
    deleted?: boolean;
    deletedAt?: string | null;
    expiresAt?: string;
    emailSent?: boolean;
    emailSentAt?: string;
}

/**
 * Backend notification response DTO - matches API schema
 */
export interface NotificationResponseDto {
    _id: string;
    userId: string;
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    category?: string;
    read: boolean;
    readAt?: string;
    emailStatus: NotificationEmailStatus;
    emailedAt?: string;
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

/**
 * Create notification DTO - for admin use
 */
export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    severity?: NotificationSeverity;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    category?: string;
}

/**
 * Broadcast notification DTO - for admin announcements
 */
export interface BroadcastNotificationDto {
    title: string;
    message: string;
    priority?: "low" | "medium" | "high" | "urgent";
    targetRoles?: string[];
    data?: Record<string, unknown>;
}

/**
 * User notification preferences
 */
export interface UserPreferences {
    id: string;
    userId: string;
    emailEnabled: boolean;
    pushEnabled: boolean;
    optOutCategories?: NotificationType[];
    quietHoursStart?: string; // HH:mm format
    quietHoursEnd?: string; // HH:mm format
    customSettings?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

/**
 * Update preferences DTO
 */
export interface UpdatePreferencesDto {
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    optOutCategories?: NotificationType[];
    quietHoursStart?: string;
    quietHoursEnd?: string;
    customSettings?: Record<string, unknown>;
}

/**
 * Legacy preferences types for backward compatibility
 * @deprecated Use UserPreferences and UpdatePreferencesDto instead
 */
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

/**
 * Query parameters for listing notifications
 */
export interface NotificationQuery {
    page?: number;
    limit?: number;
    type?: NotificationType;
    severity?: NotificationSeverity;
    read?: boolean;
    search?: string;
    userId?: string; // Admin only
    // Legacy support
    pageSize?: number;
    priority?: NotificationPriority;
    startDate?: string;
    endDate?: string;
    [key: string]: QueryValue;
}
