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

export type Notification = {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown>;
    read: boolean;
    readAt?: string | null;
    deleted?: boolean;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type NotificationListResponse = {
    data: Notification[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    unreadCount?: number;
};

export type UnreadCountResponse = { count: number };

export type NotificationQuery = {
    page?: number;
    limit?: number;
    type?: NotificationType;
    read?: boolean;
    search?: string;
};
