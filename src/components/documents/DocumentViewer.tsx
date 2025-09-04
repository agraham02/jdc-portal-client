"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    FileIcon,
    DownloadIcon,
    EyeIcon,
    ImageIcon,
    FileTextIcon,
    LoaderIcon,
    AlertCircleIcon,
} from "lucide-react";
import { FileService } from "@/lib/services/file";
import { UploadedFile } from "@/lib/types/file";

interface DocumentViewerProps {
    /** Single document ID or array of document IDs */
    documentIds: string | string[];
    /** Display mode: 'list' (default), 'grid', 'compact' */
    displayMode?: "list" | "grid" | "compact";
    /** Show download button */
    showDownload?: boolean;
    /** Show view button */
    showView?: boolean;
    /** Show file metadata (size, type, etc.) */
    showMetadata?: boolean;
    /** Maximum number of documents to show initially */
    maxVisible?: number;
    /** Custom CSS classes */
    className?: string;
    /** Loading placeholder */
    loadingPlaceholder?: React.ReactNode;
    /** Error placeholder */
    errorPlaceholder?: React.ReactNode;
}

interface DocumentWithStatus extends UploadedFile {
    loading?: boolean;
    error?: string;
}

export function DocumentViewer({
    documentIds,
    displayMode = "list",
    showDownload = true,
    showView = true,
    showMetadata = false,
    maxVisible,
    className = "",
    loadingPlaceholder,
    errorPlaceholder,
}: DocumentViewerProps) {
    const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const idsArray = Array.isArray(documentIds) ? documentIds : [documentIds];
    const filteredIds = idsArray.filter(Boolean); // Remove null/undefined values

    useEffect(() => {
        const loadDocuments = async () => {
            if (filteredIds.length === 0) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const loadedDocs: DocumentWithStatus[] = [];

            // Load documents in parallel
            const loadPromises = filteredIds.map(async (id) => {
                try {
                    const doc = await FileService.getFile(id);
                    return { ...doc, loading: false };
                } catch (error) {
                    console.error(`Failed to load document ${id}:`, error);
                    return {
                        _id: id,
                        originalName: `Document ${id}`,
                        mimetype: "unknown",
                        size: 0,
                        loading: false,
                        error: "Failed to load",
                    } as DocumentWithStatus;
                }
            });

            const results = await Promise.all(loadPromises);
            setDocuments(results);
            setLoading(false);
        };

        loadDocuments();
    }, [filteredIds.join(",")]);

    const handleDownload = async (doc: DocumentWithStatus) => {
        try {
            await FileService.triggerDownload(doc._id, doc.originalName || "document");
            toast.success(`Downloaded ${doc.originalName}`);
        } catch (error) {
            toast.error("Failed to download file");
            console.error("Download error:", error);
        }
    };

    const handleView = async (doc: DocumentWithStatus) => {
        try {
            const { url } = await FileService.getSignedViewUrl(doc._id);
            window.open(url, "_blank");
        } catch (error) {
            toast.error("Failed to open file");
            console.error("View error:", error);
        }
    };

    const getFileIcon = (mimetype: string) => {
        if (mimetype.startsWith("image/")) {
            return <ImageIcon className="h-4 w-4" />;
        }
        if (
            mimetype.includes("pdf") ||
            mimetype.includes("document") ||
            mimetype.includes("text")
        ) {
            return <FileTextIcon className="h-4 w-4" />;
        }
        return <FileIcon className="h-4 w-4" />;
    };

    const getFileTypeColor = (mimetype: string) => {
        if (mimetype.startsWith("image/")) return "bg-green-100 text-green-800";
        if (mimetype.includes("pdf")) return "bg-red-100 text-red-800";
        if (mimetype.includes("document")) return "bg-blue-100 text-blue-800";
        if (mimetype.includes("text")) return "bg-gray-100 text-gray-800";
        return "bg-gray-100 text-gray-800";
    };

    const displayedDocs = maxVisible && !showAll 
        ? documents.slice(0, maxVisible) 
        : documents;

    const hasMore = maxVisible && documents.length > maxVisible && !showAll;

    if (loading && filteredIds.length > 0) {
        return (
            <div className={`space-y-2 ${className}`}>
                {loadingPlaceholder || (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                        Loading documents...
                    </div>
                )}
            </div>
        );
    }

    if (filteredIds.length === 0) {
        return (
            <div className={`text-sm text-muted-foreground ${className}`}>
                No documents to display
            </div>
        );
    }

    if (displayMode === "compact") {
        return (
            <div className={`space-y-1 ${className}`}>
                {displayedDocs.map((doc, index) => (
                    <div
                        key={doc._id}
                        className="flex items-center justify-between text-xs p-2 border rounded"
                    >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getFileIcon(doc.mimetype)}
                            <span className="truncate">
                                {doc.originalName || `Document ${index + 1}`}
                            </span>
                            {doc.error && (
                                <AlertCircleIcon className="h-3 w-3 text-red-500 flex-shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {showView && !doc.error && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleView(doc)}
                                    className="h-6 px-2"
                                >
                                    <EyeIcon className="h-3 w-3" />
                                </Button>
                            )}
                            {showDownload && !doc.error && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDownload(doc)}
                                    className="h-6 px-2"
                                >
                                    <DownloadIcon className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                {hasMore && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAll(true)}
                        className="text-xs"
                    >
                        Show {documents.length - maxVisible!} more...
                    </Button>
                )}
            </div>
        );
    }

    if (displayMode === "grid") {
        return (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
                {displayedDocs.map((doc, index) => (
                    <Card key={doc._id} className="p-3">
                        <CardContent className="p-0">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {getFileIcon(doc.mimetype)}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium truncate">
                                            {doc.originalName || `Document ${index + 1}`}
                                        </div>
                                        {showMetadata && !doc.error && (
                                            <div className="flex gap-2 mt-1">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${getFileTypeColor(
                                                        doc.mimetype
                                                    )}`}
                                                >
                                                    {FileService.getFileExtension(
                                                        doc.originalName || ""
                                                    ).toUpperCase() || "FILE"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {FileService.formatFileSize(doc.size)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {doc.error ? (
                                    <div className="flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircleIcon className="h-3 w-3" />
                                        {doc.error}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        {showView && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleView(doc)}
                                                className="flex-1"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        )}
                                        {showDownload && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(doc)}
                                                className="flex-1"
                                            >
                                                <DownloadIcon className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {hasMore && (
                    <Card className="p-3 flex items-center justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => setShowAll(true)}
                            className="text-sm"
                        >
                            Show {documents.length - maxVisible!} more...
                        </Button>
                    </Card>
                )}
            </div>
        );
    }

    // Default list mode
    return (
        <div className={`space-y-2 ${className}`}>
            {displayedDocs.map((doc, index) => (
                <div
                    key={doc._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getFileIcon(doc.mimetype)}
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                                {doc.originalName || `Document ${index + 1}`}
                            </div>
                            {showMetadata && !doc.error && (
                                <div className="flex gap-2 mt-1">
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs ${getFileTypeColor(
                                            doc.mimetype
                                        )}`}
                                    >
                                        {FileService.getFileExtension(
                                            doc.originalName || ""
                                        ).toUpperCase() || "FILE"}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {FileService.formatFileSize(doc.size)}
                                    </span>
                                </div>
                            )}
                            {doc.error && (
                                <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    {doc.error}
                                </div>
                            )}
                        </div>
                    </div>
                    {!doc.error && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {showView && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleView(doc)}
                                >
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    View
                                </Button>
                            )}
                            {showDownload && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownload(doc)}
                                >
                                    <DownloadIcon className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            ))}
            {hasMore && (
                <div className="text-center pt-2">
                    <Button
                        variant="ghost"
                        onClick={() => setShowAll(true)}
                    >
                        Show {documents.length - maxVisible!} more documents...
                    </Button>
                </div>
            )}
        </div>
    );
}
