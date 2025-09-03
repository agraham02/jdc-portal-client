import { apiClient } from "@/lib/api";
import type { UploadedFileMeta } from "@/lib/types/files";

export const FileService = {
    upload(formData: FormData) {
        return apiClient.postFormData<UploadedFileMeta>("/files/upload", formData);
    },
    uploadProfileImage(
        file: File,
        opts?: {
            description?: string;
            isPublic?: boolean;
            relatedEntityId?: string;
            relatedEntityType?: string;
        }
    ) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", "profile_image");
        if (opts?.description) fd.append("description", opts.description);
        // Profile images should not be public by default
        fd.append("isPublic", String(opts?.isPublic ?? false));
        if (opts?.relatedEntityId) fd.append("relatedEntityId", opts.relatedEntityId);
        if (opts?.relatedEntityType) fd.append("relatedEntityType", opts.relatedEntityType);
        return apiClient.postFormData<UploadedFileMeta>("/files/upload", fd);
    },
    viewUrl(id: string, signed: boolean = true) {
        return `/files/${encodeURIComponent(id)}/view${signed ? "?signed=1" : ""}`;
    },
    downloadUrl(id: string, signed: boolean = true) {
        return `/files/${encodeURIComponent(id)}/download${signed ? "?signed=1" : ""}`;
    },
};
