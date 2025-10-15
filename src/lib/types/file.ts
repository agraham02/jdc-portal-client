import { PaginatedResponse } from "./api";

// Extend FileQueryDto for HR Documents specific queries
export interface HRDocumentQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

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

// User reference (populated)
export interface UserReference {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
}

// HR Document (File) - Response from /hr-documents/files endpoints
export interface HRDocument {
    _id: string;
    originalName: string;
    filename: string;
    size: number;
    mimetype: string;
    description?: string;
    tags: string[];
    uploadedBy: UserReference;
    approvedBy?: UserReference;
    isPublic?: boolean; // If true, visible to all users; if false, only users with FILE_READ permission
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

// HR Document List Response
export interface HRDocumentListResponse {
    files: HRDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// HR Document Download Response
export interface HRDocumentDownloadResponse {
    url: string;
    expiresIn: number; // seconds
    filename: string;
}

// HR Link Category Enum
export enum HRLinkCategory {
    PAYROLL = "payroll",
    BENEFITS = "benefits",
    TRAINING = "training",
    POLICY = "policy",
    DIRECTORY = "directory",
    OTHER = "other",
}

// HR Link
export interface HrLink {
    _id: string;
    title: string;
    description?: string;
    url: string;
    category: HRLinkCategory;
    isActive: boolean;
    isPublic?: boolean; // If true, visible to all users; if false, only users with FILE_READ permission
    sortOrder: number;
    tags: string[];
    createdBy: UserReference;
    updatedBy?: UserReference;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

// HR Link List Response
export interface HRLinkListResponse {
    links: HrLink[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Create HR Link DTO
export interface CreateHrLinkDto {
    title: string;
    description?: string;
    url: string;
    category?: HRLinkCategory | string;
    sortOrder?: number;
    tags?: string[];
    isPublic?: boolean;
}

// Update HR Link DTO
export interface UpdateHrLinkDto {
    title?: string;
    description?: string;
    url?: string;
    category?: HRLinkCategory | string;
    isActive?: boolean;
    sortOrder?: number;
    tags?: string[];
    isPublic?: boolean;
}

export type HrLinksResponse = HRLinkListResponse;
