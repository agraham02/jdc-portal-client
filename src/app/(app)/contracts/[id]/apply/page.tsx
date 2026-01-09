"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
    ArrowLeft,
    FileTextIcon,
    Download,
    Eye,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    FileUpload,
    type UploadingFileMetadata,
} from "@/components/common/FileUpload";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useAuth } from "@/lib/contexts/auth-context";
import { AccountType } from "@/lib/types/auth";
import {
    ContractsService,
    ApplicationsService,
} from "@/lib/services/contracts";
import { useApi } from "@/lib/hooks/useApi";
import { formatCurrency } from "@/lib/utils/formatters";
import { apiToast } from "@/lib/utils/toast-helpers";
import {
    ContractStatus,
    getDocumentFilename,
    type Contract,
    type FileDocument,
} from "@/lib/types/contracts";

interface FormData {
    proposal: string;
    proposedBudget?: string;
}

interface ExistingApplicationInfo {
    _id: string;
    status: string;
    applicationDate: string;
    proposalDetails?: string;
    canResubmit: boolean;
}

export default function ApplyToContractPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { accountType, hasPermission } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentUploads, setDocumentUploads] = useState<
        Map<string, UploadingFileMetadata[]>
    >(new Map());
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [existingApplication, setExistingApplication] =
        useState<ExistingApplicationInfo | null>(null);
    const [isCheckingApplication, setIsCheckingApplication] = useState(true);

    // Only vendors and admins (with SYSTEM_ADMIN) can apply
    const isVendor = accountType === AccountType.VENDOR;
    const isAdmin = hasPermission(P.SYSTEM_ADMIN);
    const canApply = isVendor || isAdmin;

    // Fetch contract details
    const {
        data: contract,
        error: contractError,
        isLoading,
    } = useApi<Contract>(`/contracts/${params.id}`);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        defaultValues: {
            proposal: "",
            proposedBudget: "",
        },
    });

    // Check for existing application on mount
    useEffect(() => {
        async function checkExisting() {
            if (!canApply || !params.id) {
                setIsCheckingApplication(false);
                return;
            }
            try {
                const result = await ApplicationsService.checkApplication(
                    params.id
                );
                if (result.hasApplication && result.application) {
                    setExistingApplication(result.application);
                    // Pre-fill proposal if resubmitting
                    if (
                        result.application.canResubmit &&
                        result.application.proposalDetails
                    ) {
                        reset({
                            proposal: result.application.proposalDetails,
                            proposedBudget: "",
                        });
                    }
                }
            } catch {
                // Ignore errors - user may not have applied yet
            } finally {
                setIsCheckingApplication(false);
            }
        }
        checkExisting();
    }, [params.id, canApply, reset]);

    // Determine if this is a resubmission
    const isResubmission = existingApplication?.canResubmit ?? false;

    // Check if contract is open for applications
    const isOpen = contract?.status === ContractStatus.OPEN;
    const requiredDocs =
        contract?.requiredDocuments?.filter((doc) => doc.required) || [];
    const optionalDocs =
        contract?.requiredDocuments?.filter((doc) => !doc.required) || [];

    // Block access for employees (non-vendors, non-admins)
    if (!canApply) {
        return (
            <ProtectedRoute requireAuth>
                <AccessDenied />
            </ProtectedRoute>
        );
    }

    function updateDocumentFiles(
        documentName: string,
        files: UploadingFileMetadata[]
    ) {
        setDocumentUploads((prev) => {
            const newMap = new Map(prev);
            newMap.set(documentName, files);
            return newMap;
        });
        setValidationErrors([]);
    }

    async function handleViewDocument(file: FileDocument) {
        try {
            const blob = await ContractsService.downloadDocumentAsBlob(
                params.id,
                file._id
            );
            const url = globalThis.URL.createObjectURL(blob);
            const newWindow = globalThis.open(url, "_blank");

            const timeoutId = globalThis.setTimeout(() => {
                globalThis.URL.revokeObjectURL(url);
            }, 3000);

            if (newWindow) {
                try {
                    newWindow.addEventListener("unload", () => {
                        globalThis.clearTimeout(timeoutId);
                        globalThis.URL.revokeObjectURL(url);
                    });
                } catch {
                    // Cross-origin tab; rely on timeout
                }
            }
        } catch (err) {
            apiToast.error("Failed to open document", err);
        }
    }

    async function handleDownloadDocument(fileId: string, filename: string) {
        try {
            await ContractsService.triggerDocumentDownload(
                params.id,
                fileId,
                filename
            );
        } catch (err) {
            apiToast.error("Failed to download document", err);
        }
    }

    async function onSubmitForm(data: FormData) {
        const errors: string[] = [];

        const FALLBACK_ALLOWED_TYPES = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/gif",
        ];
        const FALLBACK_MAX_MB = 5;

        type DocRequirement = {
            name: string;
            required?: boolean;
            acceptedTypes?: string[];
            maxSizeMB?: number;
            maxSizeMb?: number;
        };

        const contractDocs: DocRequirement[] =
            contract?.requiredDocuments || [];
        const docMap = new Map(contractDocs.map((doc) => [doc.name, doc]));

        const validateDoc = (
            doc: DocRequirement,
            uploads: UploadingFileMetadata[]
        ) => {
            const acceptedTypes =
                (doc.acceptedTypes && doc.acceptedTypes.length > 0
                    ? doc.acceptedTypes
                    : FALLBACK_ALLOWED_TYPES) || FALLBACK_ALLOWED_TYPES;
            const maxSizeMb = doc.maxSizeMB ?? doc.maxSizeMb ?? FALLBACK_MAX_MB;

            if (doc.required && uploads.length === 0) {
                errors.push(`${doc.name} is required`);
                return;
            }

            uploads.forEach((upload) => {
                const file = upload.file;
                if (!acceptedTypes.includes(file.type)) {
                    errors.push(`${doc.name}: unsupported file type`);
                }
                if (file.size > maxSizeMb * 1024 * 1024) {
                    errors.push(`${doc.name}: file exceeds ${maxSizeMb}MB`);
                }
            });
        };

        contractDocs.forEach((doc) => {
            validateDoc(doc, documentUploads.get(doc.name) || []);
        });

        // Validate any uploads for documents not defined on the contract (defensive)
        documentUploads.forEach((uploads, docName) => {
            if (!docMap.has(docName)) {
                validateDoc({ name: docName, required: false }, uploads);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);

        setIsSubmitting(true);
        try {
            // Re-check application status to avoid race conditions on resubmit
            const latestCheck = await ApplicationsService.checkApplication(
                params.id
            );
            if (
                latestCheck.hasApplication &&
                latestCheck.application &&
                !latestCheck.application.canResubmit
            ) {
                apiToast.error(
                    "You already have an active application for this contract"
                );
                setIsSubmitting(false);
                return;
            }

            const proposedBudget = data.proposedBudget
                ? Number.parseFloat(data.proposedBudget)
                : undefined;

            const files: File[] = [];
            documentUploads.forEach((uploadingFiles) => {
                files.push(...uploadingFiles.map((uf) => uf.file));
            });

            await ApplicationsService.submitApplication(
                params.id,
                { proposal: data.proposal, proposedBudget },
                files
            );

            apiToast.success(
                isResubmission
                    ? "Application Resubmitted"
                    : "Application Submitted",
                isResubmission
                    ? "Your application has been resubmitted successfully"
                    : "Your application has been submitted successfully"
            );
            router.push("/contracts/my-applications");
        } catch (err) {
            apiToast.error("Failed to submit application", err);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleCancel() {
        router.push(`/contracts/${params.id}`);
    }

    // Loading state (including checking for existing application)
    if (isLoading || isCheckingApplication) {
        return (
            <ProtectedRoute requireAuth>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    // User has an active (non-resubmittable) application
    if (existingApplication && !existingApplication.canResubmit) {
        return (
            <ProtectedRoute requireAuth>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <Button variant="ghost" onClick={handleCancel}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Contract
                    </Button>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            You have already applied to this contract. Your
                            application status is:{" "}
                            <strong>{existingApplication.status}</strong>
                        </AlertDescription>
                    </Alert>
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.push(
                                `/contracts/applications/${existingApplication._id}`
                            )
                        }
                    >
                        View Your Application
                    </Button>
                </main>
            </ProtectedRoute>
        );
    }

    // Error or contract not found
    if (contractError || !contract) {
        return (
            <ProtectedRoute requireAuth>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <Button variant="ghost" onClick={handleCancel}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {contractError instanceof Error
                                ? contractError.message
                                : "Contract not found"}
                        </AlertDescription>
                    </Alert>
                </main>
            </ProtectedRoute>
        );
    }

    // Contract not open for applications
    if (!isOpen) {
        return (
            <ProtectedRoute requireAuth>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <Button variant="ghost" onClick={handleCancel}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Contract
                    </Button>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This contract is not currently accepting
                            applications. The contract status is:{" "}
                            <strong>{contract.status}</strong>
                        </AlertDescription>
                    </Alert>
                </main>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requireAuth>
            <main className="container mx-auto max-w-4xl space-y-6 py-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            {isResubmission ? (
                                <>
                                    <RefreshCw className="h-7 w-7" />
                                    Resubmit Application
                                </>
                            ) : (
                                "Apply to Contract"
                            )}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {contract.title}
                        </p>
                    </div>
                </div>

                {/* Resubmission info banner */}
                {isResubmission && existingApplication && (
                    <Alert>
                        <RefreshCw className="h-4 w-4" />
                        <AlertDescription>
                            Your previous application was{" "}
                            <strong>
                                {existingApplication.status.toLowerCase()}
                            </strong>
                            . You can resubmit with updated information. Your
                            previous proposal has been pre-filled below—feel
                            free to modify it. You must re-upload all required
                            documents.
                        </AlertDescription>
                    </Alert>
                )}

                <form
                    onSubmit={handleSubmit(onSubmitForm)}
                    className="space-y-6"
                >
                    {/* Contract Supporting Documents */}
                    {contract.documents && contract.documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5" />
                                    Contract Supporting Documents
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Review these documents before applying
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {contract.documents.map((doc) => {
                                        const filename =
                                            getDocumentFilename(doc);
                                        return (
                                            <div
                                                key={doc._id}
                                                className="flex items-center justify-between rounded-md border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {filename}
                                                        </p>
                                                        {Boolean(doc.size) && (
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
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleViewDocument(
                                                                doc
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDownloadDocument(
                                                                doc._id,
                                                                filename
                                                            )
                                                        }
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Separator />

                    {/* Proposal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Proposal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="proposal">
                                    Proposal Details{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="proposal"
                                    placeholder="Describe your qualifications, experience, and approach for this contract..."
                                    rows={8}
                                    {...register("proposal", {
                                        required:
                                            "Proposal details are required",
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
                                    disabled={isSubmitting}
                                />
                                {errors.proposal && (
                                    <p className="text-sm text-destructive">
                                        {errors.proposal.message}
                                    </p>
                                )}
                            </div>

                            {/* Proposed Budget (Optional) */}
                            {contract.budget && (
                                <div className="space-y-2">
                                    <Label htmlFor="proposedBudget">
                                        Proposed Budget (Optional)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {contract.currency || "USD"}
                                        </span>
                                        <Input
                                            id="proposedBudget"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder={`e.g. ${contract.budget}`}
                                            {...register("proposedBudget", {
                                                min: {
                                                    value: 0,
                                                    message:
                                                        "Proposed budget must be positive",
                                                },
                                            })}
                                            disabled={isSubmitting}
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Contract budget:{" "}
                                        {formatCurrency(
                                            contract.budget,
                                            contract.currency
                                        )}
                                    </p>
                                    {errors.proposedBudget && (
                                        <p className="text-sm text-destructive">
                                            {errors.proposedBudget.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Document Uploads */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Uploads</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Upload the required documents for your
                                application
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Validation Errors */}
                            {validationErrors.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <ul className="list-disc list-inside">
                                            {validationErrors.map((error) => (
                                                <li key={error}>{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Required Documents */}
                            {requiredDocs.map((doc) => {
                                const files =
                                    documentUploads.get(doc.name) || [];
                                const hasFiles = files.length > 0;

                                return (
                                    <Card
                                        key={doc.name}
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
                                                                {
                                                                    doc.description
                                                                }
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
                                                    disabled={isSubmitting}
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
                            {optionalDocs.map((doc) => {
                                const files =
                                    documentUploads.get(doc.name) || [];
                                const hasFiles = files.length > 0;

                                return (
                                    <Card
                                        key={doc.name}
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
                                                                {
                                                                    doc.description
                                                                }
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
                                                    disabled={isSubmitting}
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

                            {/* Show message if no required documents */}
                            {requiredDocs.length === 0 &&
                                optionalDocs.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No specific documents are required for
                                        this contract.
                                    </p>
                                )}
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {(() => {
                                if (isSubmitting) {
                                    return isResubmission
                                        ? "Resubmitting..."
                                        : "Submitting...";
                                }
                                return isResubmission
                                    ? "Resubmit Application"
                                    : "Submit Application";
                            })()}
                        </Button>
                    </div>
                </form>
            </main>
        </ProtectedRoute>
    );
}
