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
    category?: string; // FileCategory enum
    hrCategory?: HrCategoryRef; // HR category reference
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

// HR Link Category Enum (legacy - for backwards compatibility)
export enum HRLinkCategory {
    PAYROLL = "payroll",
    BENEFITS = "benefits",
    TRAINING = "training",
    POLICY = "policy",
    DIRECTORY = "directory",
    OTHER = "other",
}

// HR Category (dynamic, database-managed)
export interface HrCategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface HrCategoryListResponse {
    categories: HrCategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateHrCategoryDto {
    name: string;
    slug: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export interface UpdateHrCategoryDto {
    name?: string;
    slug?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export interface HrCategoryQueryDto {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
}

// HR Link - category is now an ObjectId reference, populated on read
export interface HrLink {
    _id: string;
    title: string;
    description?: string;
    url: string;
    category: HrCategoryRef | string; // Populated object or ObjectId string
    isActive: boolean;
    isPublic: boolean;
    createdBy: UserReference;
    updatedBy?: UserReference;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

// Populated category reference (subset of HrCategory)
export interface HrCategoryRef {
    _id: string;
    name: string;
    slug: string;
}

// HR Link List Response
export interface HRLinkListResponse {
    links: HrLink[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Create HR Link DTO - category is now required ObjectId
export interface CreateHrLinkDto {
    title: string;
    description?: string;
    url: string;
    category: string; // ObjectId
    isPublic?: boolean;
}

// Update HR Link DTO
export interface UpdateHrLinkDto {
    title?: string;
    description?: string;
    url?: string;
    category?: string; // ObjectId
    isActive?: boolean;
    isPublic?: boolean;
}

export type HrLinksResponse = HRLinkListResponse;
