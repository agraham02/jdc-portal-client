"use client";

import { useState, useCallback, useRef } from "react";
import {
    Upload,
    X,
    FileIcon,
    FileText,
    FileImage,
    FileVideo,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/formatters";
import {
    FileUploadCategory,
    getFileSizeLimitBytes,
    getFileSizeLimitMB,
    getMaxFiles,
    getAllowedFileTypes,
    isValidFileSize,
    isValidFileType,
} from "@/lib/constants/file-upload";

/**
 * Generic file metadata interface
 * Extend this in your specific use case if you need additional upload tracking data
 */
export interface UploadingFileMetadata<TExtra = Record<string, never>> {
    file: File;
    progress: number;
    error?: string;
    uploadComplete?: boolean; // True when upload is confirmed by server
    metadata?: TExtra;
}

export interface FileUploadProps<TMetadata = Record<string, never>> {
    /**
     * File upload category - automatically determines size limits, allowed types, and max files
     * @required
     */
    category: FileUploadCategory;

    /**
     * Callback fired when files are successfully uploaded
     * @param fileIds - Array of file IDs returned from the server
     * @param files - Original File objects that were uploaded
     */
    onUploadComplete?: (fileIds: string[], files: File[]) => void;

    /**
     * Callback fired when upload encounters an error
     */
    onUploadError?: (error: Error) => void;

    /**
     * Custom upload function to handle the actual file upload
     * If not provided, will attempt to POST files to uploadEndpoint
     */
    onUpload?: (
        files: UploadingFileMetadata<TMetadata>[]
    ) => Promise<Array<{ _id: string }>>;

    /**
     * API endpoint for file upload (used if onUpload is not provided)
     */
    uploadEndpoint?: string;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Whether to show the upload button when drag zone is present
     * @default true
     */
    showUploadButton?: boolean;

    /**
     * Custom text for the upload button
     * @default "Select Files"
     */
    uploadButtonText?: string;

    /**
     * Whether the component is disabled
     */
    disabled?: boolean;

    /**
     * Controlled mode: externally managed uploading files
     */
    uploadingFiles?: UploadingFileMetadata<TMetadata>[];

    /**
     * Controlled mode: callback to update uploading files
     */
    onUploadingFilesChange?: (
        files: UploadingFileMetadata<TMetadata>[]
    ) => void;

    /**
     * Optional validation error message to display (e.g., from parent validation)
     */
    validationError?: string;
}

/**
 * Generic file upload component with drag-and-drop support
 *
 * @example
 * ```tsx
 * <FileUpload
 *   category={FileUploadCategory.CONTRACT}
 *   uploadEndpoint="/api/contracts/123/documents"
 *   onUploadComplete={(fileIds) => console.log('Uploaded:', fileIds)}
 * />
 * ```
 *
 * @example With custom upload handler
 * ```tsx
 * <FileUpload
 *   category={FileUploadCategory.PROFILE_IMAGE}
 *   onUpload={async (files) => {
 *     const formData = new FormData();
 *     files.forEach(({ file }) => formData.append('files', file));
 *     const response = await api.post('/upload', formData);
 *     return response.data;
 *   }}
 * />
 * ```
 */
export function FileUpload<TMetadata = Record<string, never>>({
    category,
    onUploadComplete,
    onUploadError,
    onUpload,
    uploadEndpoint,
    className,
    showUploadButton = true,
    uploadButtonText = "Select Files",
    disabled = false,
    uploadingFiles: controlledUploadingFiles,
    onUploadingFilesChange,
    validationError,
}: Readonly<FileUploadProps<TMetadata>>) {
    // Get limits from category
    const maxFileSize = getFileSizeLimitBytes(category);
    const maxFiles = getMaxFiles(category);
    const { mimeTypes, extensions } = getAllowedFileTypes(category);
    const acceptedFileTypes = [...mimeTypes, ...extensions];
    const [internalUploadingFiles, setInternalUploadingFiles] = useState<
        UploadingFileMetadata<TMetadata>[]
    >([]);
    const [isDragging, setIsDragging] = useState(false);
    const [generalError, setGeneralError] = useState<string>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use controlled or uncontrolled mode
    const uploadingFiles = controlledUploadingFiles ?? internalUploadingFiles;
    const setUploadingFiles = useCallback(
        (
            updater:
                | UploadingFileMetadata<TMetadata>[]
                | ((
                      prev: UploadingFileMetadata<TMetadata>[]
                  ) => UploadingFileMetadata<TMetadata>[])
        ) => {
            if (onUploadingFilesChange) {
                // Controlled mode
                const newFiles =
                    typeof updater === "function"
                        ? updater(controlledUploadingFiles ?? [])
                        : updater;
                onUploadingFilesChange(newFiles);
            } else {
                // Uncontrolled mode
                setInternalUploadingFiles(updater);
            }
        },
        [onUploadingFilesChange, controlledUploadingFiles]
    );

    const validateFile = useCallback(
        (file: File): string | null => {
            // Check file size using centralized validation
            if (!isValidFileSize(file.size, category)) {
                return `File size exceeds ${formatBytes(maxFileSize)}`;
            }

            // Check file type using centralized validation
            if (!isValidFileType(file.name, file.type, category)) {
                const fileExtension = `.${file.name
                    .split(".")
                    .pop()
                    ?.toLowerCase()}`;
                return `File type ${fileExtension} is not supported. Allowed: ${extensions.join(
                    ", "
                )}`;
            }

            return null;
        },
        [category, maxFileSize, extensions]
    );

    const uploadFilesToServer = useCallback(
        async (filesToUpload: UploadingFileMetadata<TMetadata>[]) => {
            try {
                let response: Array<{ _id: string }>;

                if (onUpload) {
                    // Use custom upload handler
                    response = await onUpload(filesToUpload);

                    // Mark files as upload complete for custom handlers
                    setUploadingFiles((prev) =>
                        prev.map((uf) =>
                            filesToUpload.some((f) => f.file === uf.file)
                                ? {
                                      ...uf,
                                      progress: 100,
                                      uploadComplete: true,
                                  }
                                : uf
                        )
                    );
                } else if (uploadEndpoint) {
                    // Default XMLHttpRequest upload with progress tracking
                    response = await new Promise((resolve, reject) => {
                        const formData = new FormData();
                        filesToUpload.forEach(({ file }) => {
                            formData.append("files", file);
                        });

                        const xhr = new XMLHttpRequest();

                        xhr.upload.addEventListener("progress", (e) => {
                            if (e.lengthComputable) {
                                const percentComplete =
                                    (e.loaded / e.total) * 100;
                                setUploadingFiles((prev) =>
                                    prev.map((uf) =>
                                        filesToUpload.some(
                                            (f) => f.file === uf.file
                                        )
                                            ? {
                                                  ...uf,
                                                  progress: percentComplete,
                                              }
                                            : uf
                                    )
                                );
                            }
                        });

                        xhr.addEventListener("load", () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    const data = JSON.parse(
                                        xhr.responseText
                                    ) as Array<{ _id: string }>;

                                    // Mark files as upload complete
                                    setUploadingFiles((prev) =>
                                        prev.map((uf) =>
                                            filesToUpload.some(
                                                (f) => f.file === uf.file
                                            )
                                                ? {
                                                      ...uf,
                                                      progress: 100,
                                                      uploadComplete: true,
                                                  }
                                                : uf
                                        )
                                    );

                                    resolve(data);
                                } catch {
                                    reject(
                                        new Error(
                                            "Invalid response from server"
                                        )
                                    );
                                }
                            } else {
                                reject(
                                    new Error(
                                        `Upload failed: ${xhr.statusText}`
                                    )
                                );
                            }
                        });

                        xhr.addEventListener("error", () => {
                            reject(new Error("Network error during upload"));
                        });

                        xhr.open("POST", uploadEndpoint);
                        // Note: Add auth headers here if needed via interceptor or manually
                        xhr.send(formData);
                    });
                } else {
                    throw new Error(
                        "Either onUpload or uploadEndpoint must be provided"
                    );
                }

                const fileIds = response.map((doc) => doc._id);
                const files = filesToUpload.map(({ file }) => file);

                // Remove uploaded files from state
                setUploadingFiles((prev) =>
                    prev.filter(
                        (uf) => !filesToUpload.some((f) => f.file === uf.file)
                    )
                );

                onUploadComplete?.(fileIds, files);
            } catch (error) {
                const err =
                    error instanceof Error ? error : new Error("Upload failed");
                setUploadingFiles((prev) =>
                    prev.map((uf) =>
                        filesToUpload.some((f) => f.file === uf.file)
                            ? { ...uf, error: err.message }
                            : uf
                    )
                );
                onUploadError?.(err);
            }
        },
        [
            onUpload,
            uploadEndpoint,
            onUploadComplete,
            onUploadError,
            setUploadingFiles,
        ]
    );

    const handleFiles = useCallback(
        (files: FileList | File[]) => {
            if (disabled) return;

            setGeneralError(undefined);
            const fileArray = Array.from(files);

            // Check max files limit
            if (uploadingFiles.length + fileArray.length > maxFiles) {
                setGeneralError(
                    `Cannot upload more than ${maxFiles} files at once`
                );
                return;
            }

            // Validate and prepare files
            const validFiles: UploadingFileMetadata<TMetadata>[] = [];
            const invalidFiles: string[] = [];

            for (const file of fileArray) {
                const error = validateFile(file);
                if (error) {
                    invalidFiles.push(`${file.name}: ${error}`);
                } else {
                    validFiles.push({ file, progress: 0 });
                }
            }

            if (invalidFiles.length > 0) {
                setGeneralError(invalidFiles.join("; "));
            }

            if (validFiles.length > 0) {
                setUploadingFiles((prev) => [...prev, ...validFiles]);
                // Auto-upload when using uploadEndpoint or onUpload
                if (uploadEndpoint || onUpload) {
                    uploadFilesToServer(validFiles);
                }
            }
        },
        [
            disabled,
            uploadingFiles,
            maxFiles,
            validateFile,
            uploadEndpoint,
            onUpload,
            uploadFilesToServer,
            setUploadingFiles,
        ]
    );

    const removeFile = (fileToRemove: File) => {
        if (disabled) return;
        setUploadingFiles((prev) =>
            prev.filter((uf) => uf.file !== fileToRemove)
        );
    };

    const handleDragEnter = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
        // Reset input so the same file can be selected again
        e.target.value = "";
    };

    const openFilePicker = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith("image/")) return FileImage;
        if (file.type.startsWith("video/")) return FileVideo;
        if (file.type === "application/pdf" || file.type.includes("document"))
            return FileText;
        return FileIcon;
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Drop zone */}
            <Card
                className={cn(
                    "border-2 border-dashed transition-colors",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    disabled && "cursor-not-allowed opacity-50",
                    validationError && "border-destructive"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Upload
                        className={cn(
                            "mb-4 h-12 w-12 text-muted-foreground",
                            disabled && "opacity-50"
                        )}
                    />
                    <h3 className="mb-2 text-lg font-semibold">
                        Drop files here or click to browse
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                        Supports: {extensions.join(", ")}
                    </p>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Max file size: {getFileSizeLimitMB(category)}MB • Max
                        files: {maxFiles}
                    </p>
                    {showUploadButton && (
                        <Button
                            onClick={openFilePicker}
                            type="button"
                            disabled={disabled}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploadButtonText}
                        </Button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedFileTypes.join(",")}
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={disabled}
                    />
                </div>
            </Card>

            {/* Validation error from parent */}
            {validationError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                </Alert>
            )}

            {/* General error */}
            {generalError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{generalError}</AlertDescription>
                </Alert>
            )}

            {/* Uploading files list */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                        {uploadingFiles.some((f) => f.progress === 100)
                            ? "Uploaded files"
                            : "Uploading files"}
                    </h4>
                    {uploadingFiles.map(({ file, progress, error }) => {
                        const FileIconComponent = getFileIcon(file);
                        return (
                            <Card key={file.name} className="p-4">
                                <div className="flex items-start gap-3">
                                    <FileIconComponent className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatBytes(file.size)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0"
                                                onClick={() => removeFile(file)}
                                                disabled={
                                                    disabled ||
                                                    (progress > 0 &&
                                                        progress < 100)
                                                }
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {error ? (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
                                                <AlertCircle className="h-3 w-3" />
                                                {error}
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <Progress value={progress} />
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {progress === 100
                                                        ? "Complete"
                                                        : `${Math.round(
                                                              progress
                                                          )}%`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
