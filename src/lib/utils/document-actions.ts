/**
 * Centralized document handling utilities for consistent file operations
 * across the application. Handles download, view, and preview operations
 * with proper error handling and cleanup.
 */

import { HrDocumentsService } from "@/lib/services/file";
import { toast } from "sonner";

/**
 * Supported document types for inline preview
 */
const PREVIEWABLE_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "text/plain",
];

/**
 * Check if a MIME type can be previewed inline in browser
 */
export function isPreviewable(mimeType?: string): boolean {
    if (!mimeType) return false;
    return PREVIEWABLE_TYPES.some(
        (type) =>
            mimeType === type || mimeType.startsWith(type.split("/")[0] + "/")
    );
}

/**
 * Get a friendly file type label from MIME type
 */
export function getFileTypeLabel(mimeType?: string): string {
    if (!mimeType) return "Unknown";

    const typeMap: Record<string, string> = {
        "application/pdf": "PDF",
        "application/msword": "DOC",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "DOCX",
        "application/vnd.ms-excel": "XLS",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            "XLSX",
        "application/vnd.ms-powerpoint": "PPT",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            "PPTX",
        "image/png": "PNG",
        "image/jpeg": "JPEG",
        "image/gif": "GIF",
        "image/webp": "WEBP",
        "text/plain": "TXT",
        "text/csv": "CSV",
    };

    return typeMap[mimeType] || mimeType.split("/")[1]?.toUpperCase() || "File";
}

/**
 * Download a document and save it to the user's device
 * @param documentId - The document/file ID
 * @param filename - The filename to save as
 * @param options - Optional configuration
 */
export async function downloadDocument(
    documentId: string,
    filename: string,
    options?: {
        showToast?: boolean;
        onError?: (error: Error) => void;
    }
): Promise<boolean> {
    const { showToast = true, onError } = options ?? {};

    try {
        const blob = await HrDocumentsService.downloadFile(documentId);
        triggerBlobDownload(blob, filename);

        if (showToast) {
            toast.success("Download started");
        }
        return true;
    } catch (error) {
        const err =
            error instanceof Error ? error : new Error("Download failed");

        if (showToast) {
            toast.error(err.message || "Download failed");
        }

        onError?.(err);
        return false;
    }
}

/**
 * View a document in a new browser tab
 * @param documentId - The document/file ID
 * @param options - Optional configuration
 */
export async function viewDocumentInNewTab(
    documentId: string,
    options?: {
        showToast?: boolean;
        onError?: (error: Error) => void;
    }
): Promise<boolean> {
    const { showToast = true, onError } = options ?? {};

    try {
        const blob = await HrDocumentsService.downloadFile(documentId);
        const url = window.URL.createObjectURL(blob);

        // Open in new tab
        const newTab = window.open(url, "_blank");

        if (!newTab) {
            toast.error("Please allow popups to view documents");
            window.URL.revokeObjectURL(url);
            return false;
        }

        // Clean up blob URL after a delay to ensure the new tab has loaded
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);

        return true;
    } catch (error) {
        const err =
            error instanceof Error
                ? error
                : new Error("Failed to open document");

        if (showToast) {
            toast.error(err.message || "Failed to open document");
        }

        onError?.(err);
        return false;
    }
}

/**
 * Get a blob URL for document preview (caller is responsible for cleanup)
 * @param documentId - The document/file ID
 * @returns Object with URL and cleanup function
 */
export async function getDocumentPreviewUrl(
    documentId: string
): Promise<{ url: string; revoke: () => void }> {
    const blob = await HrDocumentsService.downloadFile(documentId);
    const url = window.URL.createObjectURL(blob);

    return {
        url,
        revoke: () => window.URL.revokeObjectURL(url),
    };
}

/**
 * Trigger a download for a blob with the given filename
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Validate a file before upload
 */
export interface FileValidationOptions {
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
}

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

export function validateFile(
    file: File,
    options: FileValidationOptions = {}
): FileValidationResult {
    const {
        maxSizeMB = 100,
        allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/png",
            "image/jpeg",
            "text/plain",
        ],
        allowedExtensions,
    } = options;

    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
        };
    }

    // Check MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        const extension = file.name.split(".").pop()?.toLowerCase();

        // Also check by extension if allowed extensions provided
        if (
            allowedExtensions &&
            extension &&
            allowedExtensions.includes(`.${extension}`)
        ) {
            return { valid: true };
        }

        return {
            valid: false,
            error: `File type "${file.type || "unknown"}" is not supported`,
        };
    }

    return { valid: true };
}

/**
 * Get file icon name based on MIME type
 */
export function getFileIconType(
    mimeType?: string
): "pdf" | "doc" | "spreadsheet" | "image" | "text" | "generic" {
    if (!mimeType) return "generic";

    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.includes("word") || mimeType.includes("document"))
        return "doc";
    if (mimeType.includes("sheet") || mimeType.includes("excel"))
        return "spreadsheet";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("text/")) return "text";

    return "generic";
}
