export type FileCategory =
    | "hr_document"
    | "contract_document"
    | "vendor_document"
    | "employee_document"
    | "profile_image"
    | "other";

export type FileStatus =
    | "uploaded"
    | "processing"
    | "approved"
    | "rejected"
    | "archived";

export interface UploadedFileMeta {
    _id: string;
    originalName: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    category: FileCategory;
    status: FileStatus;
    uploadedBy: string;
    description?: string;
    tags?: string[];
    relatedEntityId?: string;
    relatedEntityType?: string;
    isPublic?: boolean;
    url?: string;
}
