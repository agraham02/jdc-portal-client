/**
 * Centralized file upload constants
 *
 * These constants define file upload rules and should match backend
 * file validation configuration in jdc-portal-api/src/common/config/file-upload.config.ts
 */

// ============================================
// File Upload Categories
// ============================================
export enum FileUploadCategory {
    CONTRACT = "contract",
    HR_DOCUMENT = "hr_document",
    VENDOR_DOCUMENT = "vendor_document",
    EMPLOYEE_DOCUMENT = "employee_document",
    OTHER = "other",
}

// ============================================
// File Size Limits (in bytes)
// ============================================
export const FILE_SIZE_LIMITS: Record<FileUploadCategory, number> = {
    [FileUploadCategory.CONTRACT]: 50 * 1024 * 1024, // 50MB
    [FileUploadCategory.HR_DOCUMENT]: 25 * 1024 * 1024, // 25MB
    [FileUploadCategory.VENDOR_DOCUMENT]: 50 * 1024 * 1024, // 50MB
    [FileUploadCategory.EMPLOYEE_DOCUMENT]: 25 * 1024 * 1024, // 25MB
    [FileUploadCategory.OTHER]: 25 * 1024 * 1024, // 25MB
};

// ============================================
// Max Files Per Upload
// ============================================
export const MAX_FILES_PER_UPLOAD: Record<FileUploadCategory, number> = {
    [FileUploadCategory.CONTRACT]: 10,
    [FileUploadCategory.HR_DOCUMENT]: 10,
    [FileUploadCategory.VENDOR_DOCUMENT]: 10,
    [FileUploadCategory.EMPLOYEE_DOCUMENT]: 10,
    [FileUploadCategory.OTHER]: 10,
};

// ============================================
// Allowed File Types
// ============================================

// MIME types
export const ALLOWED_MIME_TYPES = {
    // Documents
    PDF: "application/pdf",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    DOC: "application/msword", // Legacy Word format

    // Images
    JPEG: "image/jpeg",
    PNG: "image/png",
    GIF: "image/gif",
    WEBP: "image/webp",
} as const;

// File extensions
export const ALLOWED_FILE_EXTENSIONS = {
    // Documents
    PDF: ".pdf",
    DOCX: ".docx",
    DOC: ".doc",

    // Images
    JPEG: ".jpeg",
    JPG: ".jpg",
    PNG: ".png",
    GIF: ".gif",
    WEBP: ".webp",
} as const;

// Allowed types by category
export const ALLOWED_FILE_TYPES: Record<
    FileUploadCategory,
    { mimeTypes: string[]; extensions: string[] }
> = {
    [FileUploadCategory.CONTRACT]: {
        mimeTypes: [
            ALLOWED_MIME_TYPES.PDF,
            ALLOWED_MIME_TYPES.DOCX,
            ALLOWED_MIME_TYPES.DOC,
            ALLOWED_MIME_TYPES.JPEG,
            ALLOWED_MIME_TYPES.PNG,
            ALLOWED_MIME_TYPES.GIF,
        ],
        extensions: [
            ALLOWED_FILE_EXTENSIONS.PDF,
            ALLOWED_FILE_EXTENSIONS.DOCX,
            ALLOWED_FILE_EXTENSIONS.DOC,
            ALLOWED_FILE_EXTENSIONS.JPEG,
            ALLOWED_FILE_EXTENSIONS.JPG,
            ALLOWED_FILE_EXTENSIONS.PNG,
            ALLOWED_FILE_EXTENSIONS.GIF,
        ],
    },
    [FileUploadCategory.HR_DOCUMENT]: {
        mimeTypes: [
            ALLOWED_MIME_TYPES.PDF,
            ALLOWED_MIME_TYPES.DOCX,
            ALLOWED_MIME_TYPES.DOC,
            ALLOWED_MIME_TYPES.JPEG,
            ALLOWED_MIME_TYPES.PNG,
            ALLOWED_MIME_TYPES.GIF,
        ],
        extensions: [
            ALLOWED_FILE_EXTENSIONS.PDF,
            ALLOWED_FILE_EXTENSIONS.DOCX,
            ALLOWED_FILE_EXTENSIONS.DOC,
            ALLOWED_FILE_EXTENSIONS.JPEG,
            ALLOWED_FILE_EXTENSIONS.JPG,
            ALLOWED_FILE_EXTENSIONS.PNG,
            ALLOWED_FILE_EXTENSIONS.GIF,
        ],
    },
    [FileUploadCategory.VENDOR_DOCUMENT]: {
        mimeTypes: [
            ALLOWED_MIME_TYPES.PDF,
            ALLOWED_MIME_TYPES.DOCX,
            ALLOWED_MIME_TYPES.DOC,
            ALLOWED_MIME_TYPES.JPEG,
            ALLOWED_MIME_TYPES.PNG,
            ALLOWED_MIME_TYPES.GIF,
        ],
        extensions: [
            ALLOWED_FILE_EXTENSIONS.PDF,
            ALLOWED_FILE_EXTENSIONS.DOCX,
            ALLOWED_FILE_EXTENSIONS.DOC,
            ALLOWED_FILE_EXTENSIONS.JPEG,
            ALLOWED_FILE_EXTENSIONS.JPG,
            ALLOWED_FILE_EXTENSIONS.PNG,
            ALLOWED_FILE_EXTENSIONS.GIF,
        ],
    },
    [FileUploadCategory.EMPLOYEE_DOCUMENT]: {
        mimeTypes: [
            ALLOWED_MIME_TYPES.PDF,
            ALLOWED_MIME_TYPES.DOCX,
            ALLOWED_MIME_TYPES.DOC,
            ALLOWED_MIME_TYPES.JPEG,
            ALLOWED_MIME_TYPES.PNG,
            ALLOWED_MIME_TYPES.GIF,
        ],
        extensions: [
            ALLOWED_FILE_EXTENSIONS.PDF,
            ALLOWED_FILE_EXTENSIONS.DOCX,
            ALLOWED_FILE_EXTENSIONS.DOC,
            ALLOWED_FILE_EXTENSIONS.JPEG,
            ALLOWED_FILE_EXTENSIONS.JPG,
            ALLOWED_FILE_EXTENSIONS.PNG,
            ALLOWED_FILE_EXTENSIONS.GIF,
        ],
    },
    [FileUploadCategory.OTHER]: {
        mimeTypes: [
            ALLOWED_MIME_TYPES.PDF,
            ALLOWED_MIME_TYPES.DOCX,
            ALLOWED_MIME_TYPES.DOC,
            ALLOWED_MIME_TYPES.JPEG,
            ALLOWED_MIME_TYPES.PNG,
            ALLOWED_MIME_TYPES.GIF,
        ],
        extensions: [
            ALLOWED_FILE_EXTENSIONS.PDF,
            ALLOWED_FILE_EXTENSIONS.DOCX,
            ALLOWED_FILE_EXTENSIONS.DOC,
            ALLOWED_FILE_EXTENSIONS.JPEG,
            ALLOWED_FILE_EXTENSIONS.JPG,
            ALLOWED_FILE_EXTENSIONS.PNG,
            ALLOWED_FILE_EXTENSIONS.GIF,
        ],
    },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get file size limit in MB for a category
 */
export function getFileSizeLimitMB(category: FileUploadCategory): number {
    return FILE_SIZE_LIMITS[category] / (1024 * 1024);
}

/**
 * Get file size limit in bytes for a category
 */
export function getFileSizeLimitBytes(category: FileUploadCategory): number {
    return FILE_SIZE_LIMITS[category];
}

/**
 * Get max files allowed for a category
 */
export function getMaxFiles(category: FileUploadCategory): number {
    return MAX_FILES_PER_UPLOAD[category];
}

/**
 * Get allowed file types (MIME types and extensions) for a category
 */
export function getAllowedFileTypes(category: FileUploadCategory): {
    mimeTypes: string[];
    extensions: string[];
} {
    return ALLOWED_FILE_TYPES[category];
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate file size against category limit
 */
export function isValidFileSize(
    fileSize: number,
    category: FileUploadCategory,
): boolean {
    return fileSize <= FILE_SIZE_LIMITS[category];
}

/**
 * Validate file type against category allowed types
 */
export function isValidFileType(
    fileName: string,
    mimeType: string,
    category: FileUploadCategory,
): boolean {
    const allowed = ALLOWED_FILE_TYPES[category];
    const extension = fileName
        .toLowerCase()
        .substring(fileName.lastIndexOf("."));

    return (
        allowed.mimeTypes.includes(mimeType) ||
        allowed.extensions.includes(extension)
    );
}
