import { PaginatedResponse } from "./api";

export enum FileCategory {
    HR_DOCUMENT = "hr_document",
    CONTRACT_DOCUMENT = "contract_document",
    VENDOR_DOCUMENT = "vendor_document",
    EMPLOYEE_DOCUMENT = "employee_document",
    PROFILE_IMAGE = "profile_image",
    APPLICATION_DOCUMENT = "application_document",
    OTHER = "other",
}

export enum FileStatus {
    UPLOADED = "uploaded",
    PROCESSING = "processing",
    APPROVED = "approved",
    REJECTED = "rejected",
    ARCHIVED = "archived",
}

// DTO for uploading files
export interface UploadFileDto {
    category?: FileCategory;
    description?: string;
    tags?: string[];
    relatedEntityId?: string;
    relatedEntityType?: string;
    isPublic?: boolean;
}

// DTO for multiple file uploads
export interface MultiFileUploadDto {
    category?: FileCategory;
    description?: string;
    tags?: string[];
    relatedEntityId?: string;
    relatedEntityType?: string;
    isPublic?: boolean;
}

// DTO for updating file metadata
export interface UpdateFileDto {
    description?: string;
    tags?: string[];
    category?: FileCategory;
    isPublic?: boolean;
}

export interface FileQueryDto {
    category?: FileCategory;
    status?: FileStatus;
    relatedEntityId?: string;
    relatedEntityType?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    uploadedBy?: string;
}

export interface UploadedFile {
    _id: string;
    originalName: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    category: FileCategory;
    status: FileStatus;
    uploadedBy: {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName: string;
        email: string;
    };
    approvedBy?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName: string;
        email: string;
    };
    approvedAt?: string;
    rejectedAt?: string;
    description?: string;
    tags: string[];
    relatedEntityId?: string;
    relatedEntityType?: string;
    downloadCount: number;
    lastDownloadedAt?: string;
    isPublic: boolean;
    expiresAt?: string;
    s3Key?: string;
    s3Bucket?: string;
    createdAt: string;
    updatedAt: string;
    url?: string; // May not always be present
    downloadUrl?: string; // Signed download URL
    viewUrl?: string; // Signed view URL
    extension: string;
    sizeFormatted: string;
}

export type FileListResponse = PaginatedResponse<UploadedFile>;

export interface FileStats {
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
    categoryCounts: Record<FileCategory, number>;
    statusCounts: Record<FileStatus, number>;
    recentUploads: number; // Files uploaded in last 24h
    pendingApproval: number;
}

// HR Documents specific types
export interface HrLink {
    _id: string;
    title: string;
    url: string;
    description?: string;
    category:
        | "payroll"
        | "benefits"
        | "training"
        | "policies"
        | "directory"
        | "other";
    tags: string[];
    isActive: boolean;
    createdBy: {
        _id: string;
        fullName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateHrLinkDto {
    title: string;
    url: string;
    description?: string;
    category: string;
    tags?: string[];
    isActive?: boolean;
}

export interface UpdateHrLinkDto {
    title?: string;
    url?: string;
    description?: string;
    category?: string;
    tags?: string[];
    isActive?: boolean;
}

export type HrLinksResponse = PaginatedResponse<HrLink>;
