export enum FileCategory {
  HR_DOCUMENT = 'hr_document',
  CONTRACT_DOCUMENT = 'contract_document',
  VENDOR_DOCUMENT = 'vendor_document',
  EMPLOYEE_DOCUMENT = 'employee_document',
  PROFILE_IMAGE = 'profile_image',
  OTHER = 'other',
}

export enum FileStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export interface FileUploadDto {
  category?: FileCategory;
  description?: string;
  tags?: string[];
  relatedEntityId?: string;
  relatedEntityType?: string;
  isPublic?: boolean;
}

export interface FileQueryDto {
  category?: FileCategory;
  relatedEntityId?: string;
  relatedEntityType?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
    email: string;
  };
  approvedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  approvedAt?: string;
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
  url: string;
  extension: string;
  sizeFormatted: string;
}

export interface FilesResponse {
  files: UploadedFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  categoryCounts: Record<FileCategory, number>;
  statusCounts: Record<FileStatus, number>;
}
