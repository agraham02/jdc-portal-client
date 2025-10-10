"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    FileUpload,
    type UploadingFileMetadata,
} from "@/components/common/FileUpload";
import type { Contract } from "@/lib/types/contracts";
import { formatCurrency } from "@/lib/utils/formatters";
import {
    FileTextIcon,
    Download,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface ApplyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contract: Contract;
    onSubmit: (
        proposalDetails: string,
        documents: File[],
        bidValue?: number
    ) => Promise<void>;
    onDownloadDocument?: (fileId: string, filename: string) => Promise<void>;
    isLoading?: boolean;
}

interface FormData {
    proposalDetails: string;
    bidValue?: string;
}

export function ApplyDialog({
    open,
    onOpenChange,
    contract,
    onSubmit,
    onDownloadDocument,
    isLoading = false,
}: ApplyDialogProps) {
    // Map of document uploads: documentName -> files
    const [documentUploads, setDocumentUploads] = useState<
        Map<string, UploadingFileMetadata[]>
    >(new Map());
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    const requiredDocs =
        contract.requiredDocuments?.filter((doc) => doc.required) || [];
    const optionalDocs =
        contract.requiredDocuments?.filter((doc) => !doc.required) || [];

    function updateDocumentFiles(
        documentName: string,
        files: UploadingFileMetadata[]
    ) {
        setDocumentUploads((prev) => {
            const newMap = new Map(prev);
            newMap.set(documentName, files);
            return newMap;
        });
        // Clear validation errors when user starts uploading
        setValidationErrors([]);
    }

    async function onSubmitForm(data: FormData) {
        const errors: string[] = [];

        // Validate required documents have files
        for (const doc of requiredDocs) {
            const files = documentUploads.get(doc.name) || [];
            if (files.length === 0) {
                errors.push(`${doc.name} is required`);
            }
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const bidValue = data.bidValue
                ? parseFloat(data.bidValue)
                : undefined;

            // Collect all files from all document uploads
            const allFiles: File[] = [];
            documentUploads.forEach((files) => {
                files.forEach((uf) => allFiles.push(uf.file));
            });

            await onSubmit(data.proposalDetails, allFiles, bidValue);

            // Reset form on success
            reset();
            setDocumentUploads(new Map());
            setValidationErrors([]);
        } catch (error) {
            toast.error(
                "Failed to submit application. Please try again." +
                    (error instanceof Error ? `: ${error.message}` : "")
            );
            // Error handled by parent
        }
    }

    function handleClose() {
        reset();
        setDocumentUploads(new Map());
        setValidationErrors([]);
        onOpenChange(false);
    }

    async function handleDownload(fileId: string, filename: string) {
        if (onDownloadDocument) {
            await onDownloadDocument(fileId, filename);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Apply to Contract</DialogTitle>
                    <DialogDescription>
                        Submit your application for {contract.title}. Review the
                        supporting documents, provide your proposal, and upload
                        all required documents.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmitForm)}
                    className="space-y-6"
                >
                    {/* Supporting Documents from Contract */}
                    {contract.documents && contract.documents.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <FileTextIcon className="h-5 w-5 text-primary" />
                                        <Label className="text-base font-semibold">
                                            Contract Supporting Documents
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Review these documents before applying
                                    </p>
                                    <div className="space-y-2">
                                        {contract.documents.map(
                                            (doc, index) => (
                                                <div
                                                    key={doc._id || index}
                                                    className="flex items-center justify-between rounded-md border p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {doc.filename}
                                                            </p>
                                                            {doc.size && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {(
                                                                        doc.size /
                                                                        1024
                                                                    ).toFixed(
                                                                        1
                                                                    )}{" "}
                                                                    KB
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDownload(
                                                                doc._id,
                                                                doc.filename
                                                            )
                                                        }
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Separator />

                    {/* Proposal Details */}
                    <div className="space-y-2">
                        <Label htmlFor="proposalDetails">
                            Proposal Details{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="proposalDetails"
                            placeholder="Describe your qualifications, experience, and approach for this contract..."
                            rows={6}
                            {...register("proposalDetails", {
                                required: "Proposal details are required",
                                minLength: {
                                    value: 10,
                                    message:
                                        "Proposal must be at least 10 characters",
                                },
                                maxLength: {
                                    value: 2000,
                                    message:
                                        "Proposal cannot exceed 2000 characters",
                                },
                            })}
                            disabled={isLoading}
                        />
                        {errors.proposalDetails && (
                            <p className="text-sm text-destructive">
                                {errors.proposalDetails.message}
                            </p>
                        )}
                    </div>

                    {/* Bid Value (Optional) */}
                    {contract.budget && (
                        <div className="space-y-2">
                            <Label htmlFor="bidValue">
                                Bid Amount (Optional)
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {contract.currency || "USD"}
                                </span>
                                <Input
                                    id="bidValue"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={`e.g. ${contract.budget}`}
                                    {...register("bidValue", {
                                        min: {
                                            value: 0,
                                            message:
                                                "Bid amount must be positive",
                                        },
                                    })}
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                            </div>
                            {contract.budget && (
                                <p className="text-xs text-muted-foreground">
                                    Contract budget:{" "}
                                    {formatCurrency(
                                        contract.budget,
                                        contract.currency
                                    )}
                                </p>
                            )}
                            {errors.bidValue && (
                                <p className="text-sm text-destructive">
                                    {errors.bidValue.message}
                                </p>
                            )}
                        </div>
                    )}

                    <Separator />

                    {/* Individual File Uploads for Each Required/Optional Document */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-base font-semibold">
                                Document Uploads
                            </Label>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <ul className="list-disc list-inside">
                                        {validationErrors.map((error, i) => (
                                            <li key={i}>{error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Required Documents */}
                        {requiredDocs.map((doc, index) => {
                            const files = documentUploads.get(doc.name) || [];
                            const hasFiles = files.length > 0;

                            return (
                                <Card
                                    key={index}
                                    className="border-l-4 border-l-destructive"
                                >
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-base font-semibold">
                                                            {doc.name}
                                                        </Label>
                                                        <Badge variant="destructive">
                                                            Required
                                                        </Badge>
                                                        {hasFiles && (
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </div>
                                                    {doc.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {doc.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <FileUpload
                                                acceptedFileTypes={[
                                                    ".pdf",
                                                    ".doc",
                                                    ".docx",
                                                    ".jpg",
                                                    ".jpeg",
                                                    ".png",
                                                    ".gif",
                                                    "application/pdf",
                                                    "application/msword",
                                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                                    "image/jpeg",
                                                    "image/png",
                                                    "image/gif",
                                                ]}
                                                maxFiles={3}
                                                maxFileSizeMB={5}
                                                disabled={isLoading}
                                                uploadingFiles={files}
                                                onUploadingFilesChange={(
                                                    newFiles
                                                ) =>
                                                    updateDocumentFiles(
                                                        doc.name,
                                                        newFiles
                                                    )
                                                }
                                                showUploadButton={true}
                                                uploadButtonText="Select Files"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Optional Documents */}
                        {optionalDocs.map((doc, index) => {
                            const files = documentUploads.get(doc.name) || [];
                            const hasFiles = files.length > 0;

                            return (
                                <Card
                                    key={index}
                                    className="border-l-4 border-l-blue-500"
                                >
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-base font-semibold">
                                                            {doc.name}
                                                        </Label>
                                                        <Badge variant="secondary">
                                                            Optional
                                                        </Badge>
                                                        {hasFiles && (
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </div>
                                                    {doc.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {doc.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <FileUpload
                                                acceptedFileTypes={[
                                                    ".pdf",
                                                    ".doc",
                                                    ".docx",
                                                    ".jpg",
                                                    ".jpeg",
                                                    ".png",
                                                    ".gif",
                                                    "application/pdf",
                                                    "application/msword",
                                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                                    "image/jpeg",
                                                    "image/png",
                                                    "image/gif",
                                                ]}
                                                maxFiles={3}
                                                maxFileSizeMB={5}
                                                disabled={isLoading}
                                                uploadingFiles={files}
                                                onUploadingFilesChange={(
                                                    newFiles
                                                ) =>
                                                    updateDocumentFiles(
                                                        doc.name,
                                                        newFiles
                                                    )
                                                }
                                                showUploadButton={true}
                                                uploadButtonText="Select Files"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Submit Application"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
