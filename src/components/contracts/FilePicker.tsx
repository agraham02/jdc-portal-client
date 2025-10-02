"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/formatters";

interface FilePickerProps {
    files: File[];
    onChange: (files: File[]) => void;
    maxFiles?: number;
    maxFileSizeMB?: number;
    acceptedFileTypes?: string[];
    disabled?: boolean;
    className?: string;
}

/**
 * Simple file picker for contract creation form
 * Stores files in memory until form submission
 */
export function FilePicker({
    files,
    onChange,
    maxFiles = 5,
    maxFileSizeMB = 5,
    acceptedFileTypes = [
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".png",
        ".jpg",
        ".jpeg",
    ],
    disabled = false,
    className,
}: FilePickerProps) {
    const maxFileSize = maxFileSizeMB * 1024 * 1024;
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string>();

    const validateFile = useCallback(
        (file: File): string | null => {
            // Check file size
            if (file.size > maxFileSize) {
                return `${file.name}: File size exceeds ${formatBytes(
                    maxFileSize
                )}`;
            }

            // Check file type
            const fileExtension = `.${file.name
                .split(".")
                .pop()
                ?.toLowerCase()}`;
            if (!acceptedFileTypes.includes(fileExtension)) {
                return `${file.name}: File type ${fileExtension} is not supported`;
            }

            return null;
        },
        [maxFileSize, acceptedFileTypes]
    );

    const handleFiles = useCallback(
        (newFiles: FileList | File[]) => {
            setError(undefined);
            const fileArray = Array.from(newFiles);

            // Check max files limit
            if (files.length + fileArray.length > maxFiles) {
                setError(`Cannot add more than ${maxFiles} files`);
                return;
            }

            // Validate files
            const errors: string[] = [];
            const validFiles: File[] = [];

            for (const file of fileArray) {
                const validationError = validateFile(file);
                if (validationError) {
                    errors.push(validationError);
                } else {
                    validFiles.push(file);
                }
            }

            if (errors.length > 0) {
                setError(errors.join("; "));
            }

            if (validFiles.length > 0) {
                onChange([...files, ...validFiles]);
            }
        },
        [files, maxFiles, validateFile, onChange]
    );

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
        setError(undefined);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
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

        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
        e.target.value = ""; // Reset so same file can be selected again
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Drop zone */}
            <Card
                className={cn(
                    "cursor-pointer border-2 border-dashed p-8 transition-colors",
                    isDragging && !disabled
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    disabled && "cursor-not-allowed opacity-50"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() =>
                    !disabled && document.getElementById("file-input")?.click()
                }
            >
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept={acceptedFileTypes.join(",")}
                    onChange={handleFileInputChange}
                    disabled={disabled}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Drop files here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Maximum {maxFiles} files, {maxFileSizeMB}MB each
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supported: {acceptedFileTypes.join(", ")}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Error message */}
            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                    <p className="text-xs text-destructive">{error}</p>
                </div>
            )}

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">
                        Selected Files ({files.length}/{maxFiles})
                    </p>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center gap-3 rounded-lg border bg-card p-3"
                            >
                                <FileIcon className="h-8 w-8 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatBytes(file.size)}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    disabled={disabled}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
