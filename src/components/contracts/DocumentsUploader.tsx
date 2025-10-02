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
import { FILE_VALIDATION_RULES } from "@/lib/types/contracts";

interface UploadingFile {
    file: File;
    progress: number;
    error?: string;
}

interface DocumentsUploaderProps {
    contractId: string;
    onUploadComplete?: (fileIds: string[]) => void;
    onUploadError?: (error: Error) => void;
    acceptedFileTypes?: string[];
    maxFiles?: number;
    maxFileSizeMB?: number;
    className?: string;
}

export function DocumentsUploader({
    contractId,
    onUploadComplete,
    onUploadError,
    acceptedFileTypes = FILE_VALIDATION_RULES.allowedTypes,
    maxFiles = FILE_VALIDATION_RULES.maxFiles,
    maxFileSizeMB = FILE_VALIDATION_RULES.maxSizeMB,
    className,
}: DocumentsUploaderProps) {
    const maxFileSize = maxFileSizeMB * 1024 * 1024; // Convert MB to bytes
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [generalError, setGeneralError] = useState<string>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback(
        (file: File): string | null => {
            // Check file size
            if (file.size > maxFileSize) {
                return `File size exceeds ${formatBytes(maxFileSize)}`;
            }

            // Check file type
            const fileExtension = `.${file.name
                .split(".")
                .pop()
                ?.toLowerCase()}`;
            if (
                !acceptedFileTypes.includes(fileExtension) &&
                !acceptedFileTypes.includes(file.type)
            ) {
                return `File type ${fileExtension} is not supported`;
            }

            return null;
        },
        [maxFileSize, acceptedFileTypes]
    );

    const uploadFiles = useCallback(
        async (filesToUpload: UploadingFile[]) => {
            try {
                const formData = new FormData();
                filesToUpload.forEach(({ file }) => {
                    formData.append("files", file);
                });

                // Simulate upload progress (replace with actual API call)
                // In real implementation, use ContractsService.uploadDocuments(contractId, formData)
                // with XMLHttpRequest or fetch with progress tracking

                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        setUploadingFiles((prev) =>
                            prev.map((uf) =>
                                filesToUpload.some((f) => f.file === uf.file)
                                    ? { ...uf, progress: percentComplete }
                                    : uf
                            )
                        );
                    }
                });

                xhr.addEventListener("load", () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText) as Array<{
                            _id: string;
                        }>;
                        const fileIds = response.map((doc) => doc._id);

                        // Remove uploaded files from state
                        setUploadingFiles((prev) =>
                            prev.filter(
                                (uf) =>
                                    !filesToUpload.some(
                                        (f) => f.file === uf.file
                                    )
                            )
                        );

                        onUploadComplete?.(fileIds);
                    } else {
                        throw new Error(`Upload failed: ${xhr.statusText}`);
                    }
                });

                xhr.addEventListener("error", () => {
                    const error = new Error("Network error during upload");
                    setUploadingFiles((prev) =>
                        prev.map((uf) =>
                            filesToUpload.some((f) => f.file === uf.file)
                                ? { ...uf, error: error.message }
                                : uf
                        )
                    );
                    onUploadError?.(error);
                });

                xhr.open("POST", `/api/contracts/${contractId}/documents`);
                // Add auth headers here if needed
                xhr.send(formData);
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
        [contractId, onUploadComplete, onUploadError]
    );

    const handleFiles = useCallback(
        (files: FileList | File[]) => {
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
            const validFiles: UploadingFile[] = [];
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
                uploadFiles(validFiles);
            }
        },
        [uploadingFiles, maxFiles, validateFile, uploadFiles]
    );

    const removeFile = (fileToRemove: File) => {
        setUploadingFiles((prev) =>
            prev.filter((uf) => uf.file !== fileToRemove)
        );
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
        // Reset input so the same file can be selected again
        e.target.value = "";
    };

    const openFilePicker = () => {
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
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">
                        Drop files here or click to browse
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Supports: {acceptedFileTypes.join(", ")}
                    </p>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Max file size: {formatBytes(maxFileSize)} • Max files:{" "}
                        {maxFiles}
                    </p>
                    <Button onClick={openFilePicker} type="button">
                        <Upload className="mr-2 h-4 w-4" />
                        Select Files
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedFileTypes.join(",")}
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </div>
            </Card>

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
                    <h4 className="text-sm font-medium">Uploading files</h4>
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
                                                    progress > 0 &&
                                                    progress < 100
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
