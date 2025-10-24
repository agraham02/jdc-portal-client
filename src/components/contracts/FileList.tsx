"use client";

import { FileDocument } from "@/lib/types/contracts";
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
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { format } from "date-fns";

interface FileListProps {
    files: FileDocument[];
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
    onDownload,
    onDelete,
    showDelete = false,
    className,
}: FileListProps) {
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
                    return (
                        <Card
                            key={file._id}
                            className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {file.filename}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formatBytes(file.size)}</span>
                                        <span>•</span>
                                        <span>
                                            {format(
                                                new Date(file.updatedAt),
                                                "MMM d, yyyy"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {onDownload && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDownload(file)}
                                        title="Download"
                                    >
                                        <DownloadIcon className="h-4 w-4" />
                                    </Button>
                                )}
                                {showDelete && onDelete && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(file)}
                                        title="Delete"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2Icon className="h-4 w-4" />
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
