"use client";

import { useState } from "react";
import { FileDocument, getDocumentFilename } from "@/lib/types/contracts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    FileIcon,
    DownloadIcon,
    Trash2Icon,
    FileTextIcon,
    ImageIcon,
    FileSpreadsheetIcon,
    FileCodeIcon,
    EyeIcon,
    Loader2Icon,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { format } from "date-fns";

interface FileListProps {
    files: FileDocument[];
    onView?: (file: FileDocument) => void;
    onDownload?: (file: FileDocument) => void;
    onDelete?: (file: FileDocument) => void;
    showDelete?: boolean;
    className?: string;
}

function getFileIcon(mimetype: string) {
    if (mimetype.startsWith("image/")) return ImageIcon;
    if (mimetype === "application/pdf") return FileTextIcon;
    if (mimetype.includes("spreadsheet") || mimetype.includes("excel"))
        return FileSpreadsheetIcon;
    if (
        mimetype.includes("word") ||
        mimetype.includes("document") ||
        mimetype === "text/plain"
    )
        return FileTextIcon;
    if (mimetype === "application/zip") return FileCodeIcon;
    return FileIcon;
}

export function FileList({
    files,
    onView,
    onDownload,
    onDelete,
    showDelete = false,
    className,
}: FileListProps) {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownload = async (file: FileDocument) => {
        if (!onDownload) return;
        setDownloadingId(file._id);
        try {
            await onDownload(file);
        } finally {
            setDownloadingId(null);
        }
    };

    if (files.length === 0) {
        return (
            <div className="text-sm text-muted-foreground italic">
                No documents uploaded
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="space-y-2">
                {files.map((file) => {
                    const Icon = getFileIcon(file.mimetype);
                    const filename = getDocumentFilename(file);
                    return (
                        <Card
                            key={file._id}
                            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:shadow-md transition-all gap-3"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 flex-shrink-0">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p
                                        className="text-sm font-medium truncate mb-1"
                                        title={filename}
                                    >
                                        {filename}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formatBytes(file.size)}</span>
                                        {file.createdAt && (
                                            <>
                                                <span>•</span>
                                                <span>
                                                    {format(
                                                        new Date(
                                                            file.createdAt
                                                        ),
                                                        "MMM d, yyyy"
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {onView && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onView(file)}
                                        className="gap-2"
                                        aria-label={`View ${filename}`}
                                    >
                                        <EyeIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            View
                                        </span>
                                    </Button>
                                )}
                                {onDownload && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload(file)}
                                        className="gap-2"
                                        disabled={downloadingId === file._id}
                                        aria-label={`Download ${filename}`}
                                    >
                                        {downloadingId === file._id ? (
                                            <Loader2Icon className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <DownloadIcon className="h-4 w-4" />
                                        )}
                                        <span className="hidden sm:inline">
                                            {downloadingId === file._id
                                                ? "Downloading"
                                                : "Download"}
                                        </span>
                                    </Button>
                                )}
                                {showDelete && onDelete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(file)}
                                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                        aria-label={`Delete ${filename}`}
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            Delete
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
