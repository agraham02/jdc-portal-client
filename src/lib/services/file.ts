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
    HrLinksResponse,
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
     * Helper method to format file size
     */
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    /**
     * Helper method to get file extension
     */
    static getFileExtension(filename: string): string {
        return filename.split(".").pop()?.toLowerCase() || "";
    }
}

// HR Documents service for managing links and resources
export class HrDocumentsService {
    /**
     * Upload HR document file
     */
    static async uploadFile(
        file: File,
        metadata: UploadFileDto = {}
    ): Promise<UploadedFile> {
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

        return apiClient.postFormData<UploadedFile>(
            "/hr-documents/files/upload",
            formData
        );
    }

    /**
     * Get all HR document files
     */
    static async getFiles(query: FileQueryDto = {}): Promise<FileListResponse> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        return apiClient.get<FileListResponse>(
            `/hr-documents/files${queryString ? `?${queryString}` : ""}`
        );
    }

    /**
     * Replace HR document file
     */
    static async replaceFile(
        id: string,
        file: File,
        updates: UpdateFileDto = {}
    ): Promise<UploadedFile> {
        const formData = new FormData();
        formData.append("file", file);

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    formData.append(key, value.join(","));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        return apiClient.put<UploadedFile>(
            `/hr-documents/files/${id}`,
            formData
        );
    }

    /**
     * Delete HR document file
     */
    static async deleteFile(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(
            `/hr-documents/files/${id}`
        );
    }

    /**
     * Get HR document download URL
     */
    static async getDownloadUrl(id: string): Promise<{ url: string }> {
        return apiClient.get<{ url: string }>(
            `/hr-documents/files/${id}/download`
        );
    }

    // HR Links Management

    /**
     * Create HR link
     */
    static async createLink(data: CreateHrLinkDto): Promise<HrLink> {
        return apiClient.post<HrLink>("/hr-documents/links", data);
    }

    /**
     * Get all HR links
     */
    static async getLinks(
        query: {
            page?: number;
            pageSize?: number;
            category?: string;
            search?: string;
            isActive?: boolean;
        } = {}
    ): Promise<HrLinksResponse> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        return apiClient.get<HrLinksResponse>(
            `/hr-documents/links${queryString ? `?${queryString}` : ""}`
        );
    }

    /**
     * Get HR link by ID
     */
    static async getLink(id: string): Promise<HrLink> {
        return apiClient.get<HrLink>(`/hr-documents/links/${id}`);
    }

    /**
     * Update HR link
     */
    static async updateLink(
        id: string,
        data: UpdateHrLinkDto
    ): Promise<HrLink> {
        return apiClient.put<HrLink>(`/hr-documents/links/${id}`, data);
    }

    /**
     * Delete HR link
     */
    static async deleteLink(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(
            `/hr-documents/links/${id}`
        );
    }
}
