import { apiClient } from "../api";
import {
    UploadFileDto,
    MultiFileUploadDto,
    UpdateFileDto,
    FileQueryDto,
    FileListResponse,
    UploadedFile,
    FileStats,
    HrLink,
    CreateHrLinkDto,
    UpdateHrLinkDto,
    HRDocument,
    HRDocumentListResponse,
    HRDocumentQueryDto,
    HRLinkListResponse,
} from "../types/file";

export class FileService {
    /**
     * Helper method to build FormData for file upload
     */
    private static buildFormData(
        file: File,
        metadata: UploadFileDto = {}
    ): FormData {
        const formData = new FormData();
        formData.append("file", file);

        Object.entries(metadata).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    formData.append(key, value.join(","));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        return formData;
    }

    /**
     * Upload a single file
     */
    static async uploadFile(
        file: File,
        metadata: UploadFileDto = {}
    ): Promise<UploadedFile> {
        const formData = this.buildFormData(file, metadata);
        return apiClient.postFormData<UploadedFile>("/files/upload", formData);
    }

    /**
     * Upload multiple files
     */
    static async uploadMultipleFiles(
        files: File[],
        metadata: MultiFileUploadDto = {}
    ): Promise<{ files: UploadedFile[] }> {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append("files", file);
        });

        Object.entries(metadata).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    formData.append(key, value.join(","));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        return apiClient.postFormData<{ files: UploadedFile[] }>(
            "/files/upload/multiple",
            formData
        );
    }

    /**
     * Upload an HR document (requires admin/employee permission)
     */
    static async uploadHrDocument(
        file: File,
        metadata: UploadFileDto = {}
    ): Promise<UploadedFile> {
        const formData = this.buildFormData(file, metadata);
        return apiClient.postFormData<UploadedFile>(
            "/files/upload/hr-document",
            formData
        );
    }

    /**
     * Get all files with filtering and pagination
     */
    static async getFiles(query: FileQueryDto = {}): Promise<FileListResponse> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/files?${queryString}` : "/files";

        return apiClient.get<FileListResponse>(endpoint);
    }

    /**
     * Get HR documents for all employees
     */
    static async getHrDocuments(
        query: FileQueryDto = {}
    ): Promise<FileListResponse> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const endpoint = queryString
            ? `/files/hr-documents?${queryString}`
            : "/files/hr-documents";

        return apiClient.get<FileListResponse>(endpoint);
    }

    /**
     * Get file metadata by ID
     */
    static async getFile(id: string): Promise<UploadedFile> {
        return apiClient.get<UploadedFile>(`/files/${id}`);
    }

    /**
     * Get file download URL
     */
    static async getDownloadUrl(id: string): Promise<{ url: string }> {
        return apiClient.get<{ url: string }>(`/files/${id}/download`);
    }

    /**
     * View file in browser (for images, PDFs, etc.)
     */
    static async getViewUrl(id: string): Promise<{ url: string }> {
        return apiClient.get<{ url: string }>(`/files/${id}/view`);
    }

    /**
     * Download file by ID
     */
    static async downloadFile(id: string): Promise<Blob> {
        // Prefer signed URL if backend provides it
        try {
            const { url } = await this.getDownloadUrl(id);
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to download file");
            return await response.blob();
        } catch {
            // Fallback: some servers stream directly from /files/{id}/download
            return apiClient.getBlob(`/files/${id}/download`);
        }
    }

    /**
     * Update file metadata
     */
    static async updateFile(
        id: string,
        updates: UpdateFileDto
    ): Promise<UploadedFile> {
        return apiClient.patch<UploadedFile>(`/files/${id}`, updates);
    }

    /**
     * Replace file content and update metadata
     */
    static async replaceFile(
        id: string,
        file: File,
        updates: UpdateFileDto = {}
    ): Promise<UploadedFile> {
        const formData = this.buildFormData(file, updates);
        return apiClient.put<UploadedFile>(`/files/${id}/replace`, formData);
    }

    /**
     * Delete file
     */
    static async deleteFile(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/files/${id}`);
    }

    /**
     * Approve file (requires admin/employee permission)
     */
    static async approveFile(id: string): Promise<UploadedFile> {
        return apiClient.patch<UploadedFile>(`/files/${id}/approve`, {});
    }

    /**
     * Reject file (requires admin/employee permission)
     */
    static async rejectFile(id: string): Promise<UploadedFile> {
        return apiClient.patch<UploadedFile>(`/files/${id}/reject`, {});
    }

    /**
     * Get file statistics
     */
    static async getFileStats(): Promise<FileStats> {
        return apiClient.get<FileStats>("/files/stats");
    }

    /**
     * View public file without authentication
     */
    static async viewPublicFile(id: string): Promise<{ url: string }> {
        return apiClient.get<{ url: string }>(`/files/public/${id}/view`);
    }

    /**
     * Helper method to trigger file download in browser
     */
    static async triggerDownload(id: string, filename: string): Promise<void> {
        try {
            const blob = await this.downloadFile(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            throw error;
        }
    }
    /**
     * Helper method to get file extension
     */
    static getFileExtension(filename: string): string {
        return filename.split(".").pop()?.toLowerCase() || "";
    }
}

// HR Documents service for managing HR documents and links
export interface HrDocumentMetadata {
    description?: string;
    tags?: string[];
    isPublic?: boolean;
}

export class HrDocumentsService {
    /**
     * Helper method to build FormData for file upload
     */
    private static buildFormData(
        file: File,
        metadata: HrDocumentMetadata = {}
    ): FormData {
        const formData = new FormData();
        formData.append("file", file);

        if (metadata.description) {
            formData.append("description", metadata.description);
        }
        if (metadata.tags && metadata.tags.length > 0) {
            // Backend expects tags as array items
            metadata.tags.forEach((tag) => formData.append("tags", tag));
        }
        if (metadata.isPublic !== undefined) {
            formData.append("isPublic", metadata.isPublic.toString());
        }

        return formData;
    }

    // === HR DOCUMENTS (FILES) ===

    /**
     * Upload HR document file
     * POST /hr-documents/files/upload
     */
    static async uploadFile(
        file: File,
        metadata: HrDocumentMetadata = {}
    ): Promise<HRDocument> {
        const formData = this.buildFormData(file, metadata);
        return apiClient.postFormData<HRDocument>(
            "/hr-documents/files/upload",
            formData
        );
    }

    /**
     * Get all HR document files with pagination and filtering
     * GET /hr-documents/files
     */
    static async getFiles(
        query: HRDocumentQueryDto = {}
    ): Promise<HRDocumentListResponse> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        return apiClient.get<HRDocumentListResponse>(
            `/hr-documents/files${queryString ? `?${queryString}` : ""}`
        );
    }

    /**
     * Download HR document file directly as blob
     * GET /hr-documents/files/:id/download
     * Note: Backend returns the file directly, not a presigned URL
     */
    static async downloadFile(id: string): Promise<Blob> {
        return apiClient.getBlob(`/hr-documents/files/${id}/download`);
    }

    /**
     * Replace HR document file
     * PUT /hr-documents/files/:id
     */
    static async replaceFile(
        id: string,
        file: File,
        metadata: HrDocumentMetadata = {}
    ): Promise<HRDocument> {
        const formData = this.buildFormData(file, metadata);
        return apiClient.put<HRDocument>(`/hr-documents/files/${id}`, formData);
    }

    /**
     * Delete HR document file
     * DELETE /hr-documents/files/:id
     */
    static async deleteFile(id: string): Promise<void> {
        return apiClient.delete<void>(`/hr-documents/files/${id}`);
    }

    // === HR LINKS ===

    /**
     * Create HR link
     * POST /hr-documents/links
     */
    static async createLink(data: CreateHrLinkDto): Promise<HrLink> {
        return apiClient.post<HrLink>("/hr-documents/links", data);
    }

    /**
     * Get all HR links with pagination and filtering
     * GET /hr-documents/links
     */
    static async getLinks(
        query: {
            page?: number;
            limit?: number;
            search?: string;
            category?: string;
            isActive?: boolean;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        } = {}
    ): Promise<HRLinkListResponse> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        return apiClient.get<HRLinkListResponse>(
            `/hr-documents/links${queryString ? `?${queryString}` : ""}`
        );
    }

    /**
     * Get HR link by ID
     * GET /hr-documents/links/:id
     */
    static async getLink(id: string): Promise<HrLink> {
        return apiClient.get<HrLink>(`/hr-documents/links/${id}`);
    }

    /**
     * Update HR link
     * PUT /hr-documents/links/:id
     */
    static async updateLink(
        id: string,
        data: UpdateHrLinkDto
    ): Promise<HrLink> {
        return apiClient.put<HrLink>(`/hr-documents/links/${id}`, data);
    }

    /**
     * Delete HR link
     * DELETE /hr-documents/links/:id
     */
    static async deleteLink(id: string): Promise<void> {
        return apiClient.delete<void>(`/hr-documents/links/${id}`);
    }

    // === HELPER METHODS ===

    /**
     * Helper method to trigger file download in browser
     */
    static async triggerDownload(id: string, filename: string): Promise<void> {
        try {
            const blob = await this.downloadFile(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            throw error;
        }
    }
}
