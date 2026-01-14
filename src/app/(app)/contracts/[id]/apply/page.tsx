"use client";

import { useState, useEffect, useMemo } from "react";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    FileUpload,
    type UploadingFileMetadata,
} from "@/components/common/FileUpload";
import { FileUploadCategory } from "@/lib/constants/file-upload";
import { TEXT_CONSTRAINTS } from "@/lib/constants/validation";
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
    const [documentErrors, setDocumentErrors] = useState<Map<string, string>>(
        new Map()
    );
    const [existingApplication, setExistingApplication] =
        useState<ExistingApplicationInfo | null>(null);
    const [isCheckingApplication, setIsCheckingApplication] = useState(true);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

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
        formState: { errors, isDirty },
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

    // Check if any files are currently uploading or not yet confirmed by server
    const hasUploadingFiles = useMemo(() => {
        return Array.from(documentUploads.values()).some((files) =>
            files.some(
                (f) =>
                    (f.progress > 0 && f.progress < 100) ||
                    (f.progress === 100 && f.uploadComplete !== true)
            )
        );
    }, [documentUploads]);

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
        const newDocumentErrors = new Map<string, string>();

        type DocRequirement = {
            name: string;
            required?: boolean;
            acceptedTypes?: string[];
            maxSizeMB?: number;
            maxSizeMb?: number;
        };

        const contractDocs: DocRequirement[] =
            contract?.requiredDocuments || [];

        // Validate required documents
        contractDocs.forEach((doc) => {
            const uploads = documentUploads.get(doc.name) || [];

            // Check 1: Required documents must have files
            if (doc.required && uploads.length === 0) {
                const errorMsg = `Please upload required document: ${doc.name}`;
                errors.push(errorMsg);
                newDocumentErrors.set(doc.name, errorMsg);
                return;
            }

            // Skip further checks if no uploads for optional docs
            if (uploads.length === 0) return;

            // Check 2: Files must not have upload errors
            const filesWithErrors = uploads.filter((u) => u.error);
            if (filesWithErrors.length > 0) {
                const errorMsg = `Some files for "${doc.name}" have errors. Please fix or remove them.`;
                errors.push(errorMsg);
                newDocumentErrors.set(doc.name, errorMsg);
                return;
            }

            // Check 3: Files must finish uploading (not in progress) and be confirmed by server
            const uploadingFiles = uploads.filter(
                (u) =>
                    (u.progress > 0 && u.progress < 100) ||
                    (u.progress === 100 && u.uploadComplete !== true)
            );
            if (uploadingFiles.length > 0) {
                const errorMsg = `Files for "${doc.name}" are still uploading. Please wait.`;
                errors.push(errorMsg);
                newDocumentErrors.set(doc.name, errorMsg);
                return;
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            setDocumentErrors(newDocumentErrors);

            // Scroll to first error - check form fields first, then file uploads
            setTimeout(() => {
                const firstFormError = document.querySelector(
                    '[aria-invalid="true"]'
                );
                const firstUploadError =
                    newDocumentErrors.size > 0
                        ? document.querySelector("[data-validation-error]")
                        : null;

                const firstError = firstFormError || firstUploadError;

                if (firstError) {
                    firstError.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });

                    // Focus the element for keyboard users
                    if (firstError instanceof HTMLElement) {
                        firstError.focus();
                    }
                } else {
                    // Fallback to top if no error element found
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }, 100);

            return;
        }

        setValidationErrors([]);
        setDocumentErrors(new Map());

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
        // Check if user has entered data or uploaded files
        const hasData = documentUploads.size > 0 || isDirty;

        if (hasData && !showCancelDialog) {
            setShowCancelDialog(true);
            return;
        }

        // Clear state and navigate
        setDocumentUploads(new Map());
        setValidationErrors([]);
        setDocumentErrors(new Map());
        reset(); // Reset form
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
                                            value: TEXT_CONSTRAINTS.PROPOSAL_MIN_LENGTH,
                                            message:
                                                TEXT_CONSTRAINTS.PROPOSAL_MIN_LENGTH >
                                                0
                                                    ? `Proposal must be at least ${TEXT_CONSTRAINTS.PROPOSAL_MIN_LENGTH} characters`
                                                    : "Proposal cannot be empty",
                                        },
                                        maxLength: {
                                            value: TEXT_CONSTRAINTS.PROPOSAL_MAX_LENGTH,
                                            message: `Proposal cannot exceed ${TEXT_CONSTRAINTS.PROPOSAL_MAX_LENGTH} characters`,
                                        },
                                    })}
                                    disabled={isSubmitting}
                                    aria-required="true"
                                    aria-invalid={!!errors.proposal}
                                    aria-describedby={
                                        errors.proposal
                                            ? "proposal-error"
                                            : undefined
                                    }
                                />
                                {errors.proposal && (
                                    <p
                                        id="proposal-error"
                                        className="text-sm text-destructive"
                                        role="alert"
                                    >
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
                                            aria-invalid={
                                                !!errors.proposedBudget
                                            }
                                            aria-describedby={
                                                errors.proposedBudget
                                                    ? "proposedBudget-error"
                                                    : undefined
                                            }
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
                                        <p
                                            id="proposedBudget-error"
                                            className="text-sm text-destructive"
                                            role="alert"
                                        >
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
                                            <div
                                                className="space-y-3"
                                                data-validation-error={
                                                    documentErrors.has(doc.name)
                                                        ? "true"
                                                        : undefined
                                                }
                                            >
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
                                                            {!hasFiles &&
                                                                documentErrors.has(
                                                                    doc.name
                                                                ) && (
                                                                    <AlertCircle className="h-4 w-4 text-destructive" />
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
                                                    category={
                                                        FileUploadCategory.CONTRACT
                                                    }
                                                    disabled={isSubmitting}
                                                    uploadingFiles={files}
                                                    onUploadingFilesChange={(
                                                        newFiles
                                                    ) => {
                                                        updateDocumentFiles(
                                                            doc.name,
                                                            newFiles
                                                        );
                                                        // Clear error when files are added
                                                        if (
                                                            newFiles.length >
                                                                0 &&
                                                            doc.required
                                                        ) {
                                                            setDocumentErrors(
                                                                (prev) => {
                                                                    const next =
                                                                        new Map(
                                                                            prev
                                                                        );
                                                                    next.delete(
                                                                        doc.name
                                                                    );
                                                                    return next;
                                                                }
                                                            );
                                                        }
                                                    }}
                                                    showUploadButton={true}
                                                    uploadButtonText="Select Files"
                                                    validationError={documentErrors.get(
                                                        doc.name
                                                    )}
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
                                            <div
                                                className="space-y-3"
                                                data-validation-error={
                                                    documentErrors.has(doc.name)
                                                        ? "true"
                                                        : undefined
                                                }
                                            >
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
                                                    category={
                                                        FileUploadCategory.CONTRACT
                                                    }
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
                                                    validationError={documentErrors.get(
                                                        doc.name
                                                    )}
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
                        <Button
                            type="submit"
                            disabled={isSubmitting || hasUploadingFiles}
                        >
                            {hasUploadingFiles
                                ? "Uploading files..."
                                : isSubmitting
                                ? "Submitting..."
                                : "Submit Application"}
                        </Button>
                    </div>

                    {/* Cancel Confirmation Dialog */}
                    <AlertDialog
                        open={showCancelDialog}
                        onOpenChange={setShowCancelDialog}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Discard Application?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    You have unsaved changes. Are you sure you
                                    want to cancel? All your progress will be
                                    lost.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Continue Editing
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        setShowCancelDialog(false);
                                        handleCancel();
                                    }}
                                >
                                    Discard Changes
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </form>
            </main>
        </ProtectedRoute>
    );
}
