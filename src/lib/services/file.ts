import { apiClient } from "../api";
import { session } from "../session";
import {
    FileUploadDto,
    FileQueryDto,
    FilesResponse,
    UploadedFile,
    FileStats,
} from "../types/file";

export class FileService {
    /**
     * Helper method to build FormData for file upload
     */
    private static buildFormData(
        file: File,
        metadata: FileUploadDto = {}
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
     * Upload a general file
     */
    static async uploadFile(
        file: File,
        metadata: FileUploadDto = {}
    ): Promise<UploadedFile> {
        const formData = this.buildFormData(file, metadata);
        return apiClient.postFormData<UploadedFile>("/files/upload", formData);
    }

    /**
     * Upload an HR document (requires HR_DOCUMENT_CREATE permission)
     */
    static async uploadHrDocument(
        file: File,
        metadata: FileUploadDto = {}
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
    static async getFiles(query: FileQueryDto = {}): Promise<FilesResponse> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/files?${queryString}` : "/files";

        return apiClient.get<FilesResponse>(endpoint);
    }

    /**
     * Get HR documents for all employees
     */
    static async getHrDocuments(
        query: FileQueryDto = {}
    ): Promise<FilesResponse> {
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

        return apiClient.get<FilesResponse>(endpoint);
    }

    /**
     * Get file metadata by ID
     */
    static async getFile(id: string): Promise<UploadedFile> {
        return apiClient.get<UploadedFile>(`/files/${id}`);
    }

    /**
     * Download file by ID
     */
    static async downloadFile(id: string): Promise<Blob> {
        const accessToken = session.getAccessToken();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/files/${id}/download`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to download file");
        }

        return response.blob();
    }

    /**
     * Get a signed URL for file download
     */
    static async getSignedDownloadUrl(id: string): Promise<{ url: string }> {
        return apiClient.get<{ url: string }>(`/files/${id}/download?signed=1`);
    }

    /**
     * Get a signed URL for file viewing
     */
    static async getSignedViewUrl(id: string): Promise<{ url: string }> {
        return apiClient.get<{ url: string }>(`/files/${id}/view?signed=1`);
    }

    /**
     * Update file metadata
     */
    static async updateFile(
        id: string,
        updates: Partial<FileUploadDto>
    ): Promise<UploadedFile> {
        return apiClient.patch<UploadedFile>(`/files/${id}`, updates);
    }

    /**
     * Replace file binary and optionally update metadata
     */
    static async replaceFile(
        id: string,
        file: File,
        updates: Partial<FileUploadDto> = {}
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
        return apiClient.patch<UploadedFile>(`/files/${id}/replace`, formData);
    }

    /**
     * Delete file
     */
    static async deleteFile(id: string): Promise<void> {
        return apiClient.delete<void>(`/files/${id}`);
    }

    /**
     * Approve file (requires FILE_APPROVE permission)
     */
    static async approveFile(id: string): Promise<UploadedFile> {
        return apiClient.patch<UploadedFile>(`/files/${id}/approve`, {});
    }

    /**
     * Reject file (requires FILE_APPROVE permission)
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
