"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Download,
    ExternalLink,
    FileIcon,
    AlertCircle,
    Loader2,
} from "lucide-react";
import {
    getDocumentPreviewUrl,
    downloadDocument,
    isPreviewable,
    getFileTypeLabel,
} from "@/lib/utils/document-actions";
import { formatBytes } from "@/lib/utils/formatters";

export interface DocumentPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentId: string;
    filename: string;
    mimeType?: string;
    fileSize?: number;
    description?: string;
}

export function DocumentPreviewModal({
    open,
    onOpenChange,
    documentId,
    filename,
    mimeType,
    fileSize,
    description,
}: Readonly<DocumentPreviewModalProps>) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [revokeUrl, setRevokeUrl] = useState<(() => void) | null>(null);
    const [previewLoadError, setPreviewLoadError] = useState(false);

    const canPreview = isPreviewable(mimeType);

    // Load preview when modal opens
    useEffect(() => {
        if (open && documentId && canPreview) {
            loadPreview();
        }

        return () => {
            // Cleanup on unmount or close
            if (revokeUrl) {
                revokeUrl();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, documentId, canPreview]);

    const loadPreview = async () => {
        setLoading(true);
        setError(null);

        try {
            const { url, revoke } = await getDocumentPreviewUrl(documentId);
            setPreviewUrl(url);
            setRevokeUrl(() => revoke);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load preview";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = useCallback(() => {
        // Cleanup blob URL when closing
        if (revokeUrl) {
            revokeUrl();
        }
        setPreviewUrl(null);
        setRevokeUrl(null);
        setError(null);
        setPreviewLoadError(false);
        onOpenChange(false);
    }, [onOpenChange, revokeUrl]);

    const handlePreviewError = useCallback(() => {
        setPreviewLoadError(true);
    }, []);

    const handleDownload = async () => {
        await downloadDocument(documentId, filename);
    };

    const handleOpenInNewTab = () => {
        if (previewUrl) {
            window.open(previewUrl, "_blank");
        }
    };

    const fileTypeLabel = getFileTypeLabel(mimeType);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                            <DialogTitle className="truncate text-lg">
                                {filename}
                            </DialogTitle>
                            <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary">
                                    {fileTypeLabel}
                                </span>
                                {fileSize && (
                                    <span className="text-xs">
                                        {formatBytes(fileSize)}
                                    </span>
                                )}
                                {description && (
                                    <span
                                        className="text-xs truncate max-w-xs"
                                        title={description}
                                    >
                                        • {description}
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </Button>
                            {previewUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleOpenInNewTab}
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    New Tab
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 mt-4 rounded-lg border bg-muted/30 overflow-hidden">
                    {loading && (
                        <div className="flex items-center justify-center h-96">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Loading preview...
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-96 p-6">
                            <Alert variant="destructive" className="max-w-md">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {!loading && !error && !canPreview && (
                        <div className="flex flex-col items-center justify-center h-96 p-6 text-center">
                            <FileIcon className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                Preview not available
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                                This file type ({fileTypeLabel}) cannot be
                                previewed in the browser. Please download the
                                file to view it.
                            </p>
                            <Button onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download {filename}
                            </Button>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        canPreview &&
                        previewUrl &&
                        !previewLoadError && (
                            <>
                                {mimeType === "application/pdf" && (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-[70vh]"
                                        title={`Preview: ${filename}`}
                                        onError={handlePreviewError}
                                    />
                                )}
                                {mimeType?.startsWith("image/") && (
                                    <div className="flex items-center justify-center p-4 h-[70vh]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={previewUrl}
                                            alt={filename}
                                            className="max-w-full max-h-full object-contain"
                                            onError={handlePreviewError}
                                        />
                                    </div>
                                )}
                                {mimeType === "text/plain" && (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-[70vh] bg-white dark:bg-gray-900"
                                        title={`Preview: ${filename}`}
                                        onError={handlePreviewError}
                                    />
                                )}
                            </>
                        )}

                    {previewLoadError && (
                        <div className="flex flex-col items-center justify-center h-96 p-6 text-center">
                            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                Failed to load preview
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                                The file preview could not be loaded. Please
                                download the file to view it.
                            </p>
                            <Button onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download {filename}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
