"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Building,
    Mail,
    Trophy,
    ExternalLink,
    CheckCircle,
    XCircle,
    Award,
    Undo2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ContractErrorBoundary } from "@/components/common/RouteErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common";
import { FileList, ConfirmDialog, RejectDialog } from "@/components/contracts";
import {
    ApplicationsService,
    ContractsService,
} from "@/lib/services/contracts";
import { formatCurrency } from "@/lib/utils/formatters";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useAuth } from "@/lib/contexts/auth-context";
import { AccountType } from "@/lib/types/auth";
import { apiToast } from "@/lib/utils/toast-helpers";
import { errorMessages, successMessages } from "@/lib/utils/error-messages";
import { Can } from "@/components/auth/Can";
import {
    getVendorDisplayName,
    getContractId,
    getContractTitle,
    getDocumentFilename,
    ApplicationStatus,
    ReviewStatus,
    ContractStatus,
} from "@/lib/types/contracts";
import type {
    Application,
    ApplicationStatusHistory,
    FileDocument,
    ContractMinimal,
} from "@/lib/types/contracts";
import { motion } from "motion/react";
import { pageTransition } from "@/lib/animations";
import { toast } from "sonner";

/**
 * Get the date when an application transitioned to a specific status
 * by looking through its statusHistory
 */
function getStatusTransitionDate(
    statusHistory: ApplicationStatusHistory[] | undefined,
    targetStatus: ApplicationStatus,
): string | null {
    if (!statusHistory || statusHistory.length === 0) return null;
    const entry = statusHistory.find((h) => h.newStatus === targetStatus);
    return entry?.changedAt ?? null;
}

/**
 * Get the rejection reason (comments) from statusHistory when application was rejected
 */
function getRejectionReason(
    statusHistory: ApplicationStatusHistory[] | undefined,
): string | null {
    if (!statusHistory || statusHistory.length === 0) return null;
    const rejectionEntry = statusHistory.find(
        (h) => h.newStatus === ApplicationStatus.REJECTED && h.comments,
    );
    return rejectionEntry?.comments ?? null;
}

export default function ApplicationDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { accountType, hasPermission, user } = useAuth();

    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Dialog states
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [awardDialogOpen, setAwardDialogOpen] = useState(false);
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

    // Check if user can view this application
    // Vendors can view their own applications, employees/admins with CONTRACT_MANAGE_APPLICATIONS can view all
    const isVendor = accountType === AccountType.VENDOR;
    const isAdmin = hasPermission(P.SYSTEM_ADMIN);
    const canManageApplications = hasPermission(P.CONTRACT_MANAGE_APPLICATIONS);

    const canViewApplication = useMemo(() => {
        if (isAdmin || canManageApplications) return true;
        if (isVendor && user && application) {
            return application.userId === user._id;
        }
        return false;
    }, [application, canManageApplications, isAdmin, isVendor, user]);

    const loadApplication = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ApplicationsService.getApplication(params.id);
            setApplication(data);
        } catch (err) {
            console.error("Failed to load application:", err);
            setError("Failed to load application details");
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        loadApplication();
    }, [loadApplication]);

    // Periodically refresh to avoid stale status when viewed for long sessions
    useEffect(() => {
        const interval = window.setInterval(() => {
            loadApplication();
        }, 15000);
        return () => window.clearInterval(interval);
    }, [loadApplication]);

    async function handleViewDocument(doc: FileDocument) {
        if (!application) return;
        try {
            // Use the view endpoint (opens inline in browser)
            const response =
                await ApplicationsService.getApplicationDocumentViewUrl(
                    application._id,
                    doc._id,
                );
            globalThis.open(response.url, "_blank");
        } catch (err) {
            apiToast.error("Failed to view document", err);
        }
    }

    async function handleDownloadDocument(doc: FileDocument) {
        if (!application) return;
        try {
            // Use the download endpoint (forces download with Content-Disposition: attachment)
            const response =
                await ApplicationsService.getApplicationDocumentDownloadUrl(
                    application._id,
                    doc._id,
                );
            // Use anchor element with download attribute to trigger download
            // This avoids CORS issues since it's a navigation, not a fetch
            const a = document.createElement("a");
            a.href = response.url;
            a.download = getDocumentFilename(doc);
            // For cross-origin URLs, the download attribute may not work in all browsers
            // So we also set target to trigger download behavior
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("Download started");
        } catch (err) {
            apiToast.error("Failed to download document", err);
        }
    }

    function handleGoToContract() {
        if (!application) return;
        const contractId = getContractId(application);
        if (contractId) {
            router.push(`/contracts/${contractId}`);
        }
    }

    // Action handlers
    async function handleAccept() {
        if (!application) return;
        try {
            setActionLoading(true);
            await ApplicationsService.updateApplicationStatus(application._id, {
                status: ReviewStatus.ACCEPTED,
            });
            apiToast.success(successMessages.applications.statusUpdated);
            await loadApplication();
        } catch (err) {
            apiToast.error(errorMessages.applications.updateStatus, err);
        } finally {
            setActionLoading(false);
            setAcceptDialogOpen(false);
        }
    }

    async function handleReject(reason?: string) {
        if (!application) return;
        try {
            setActionLoading(true);
            await ApplicationsService.updateApplicationStatus(application._id, {
                status: ReviewStatus.REJECTED,
                comments: reason,
            });
            apiToast.success(successMessages.applications.statusUpdated);
            await loadApplication();
        } catch (err) {
            apiToast.error(errorMessages.applications.updateStatus, err);
        } finally {
            setActionLoading(false);
            setRejectDialogOpen(false);
        }
    }

    async function handleAward() {
        if (!application) return;
        const contractId = getContractId(application);
        if (!contractId) return;

        if (!isContractOpen) {
            apiToast.error("This contract is no longer accepting awards");
            setAwardDialogOpen(false);
            return;
        }
        try {
            setActionLoading(true);
            await ContractsService.awardContract(contractId, {
                applicationId: application._id,
            });
            apiToast.success("Contract awarded successfully");
            await loadApplication();
        } catch (err) {
            apiToast.error("Failed to award contract", err);
        } finally {
            setActionLoading(false);
            setAwardDialogOpen(false);
        }
    }

    async function handleWithdraw() {
        if (!application) return;
        try {
            setActionLoading(true);
            await ApplicationsService.withdrawApplication(application._id);
            apiToast.success("Application withdrawn successfully");
            await loadApplication();
        } catch (err) {
            apiToast.error("Failed to withdraw application", err);
        } finally {
            setActionLoading(false);
            setWithdrawDialogOpen(false);
        }
    }

    // Determine if current user is the winner - awarded status means they won
    const isWinner = application?.status === ApplicationStatus.AWARDED;

    // Determine what actions are available based on status
    const canAcceptReject =
        application?.status === ApplicationStatus.SUBMITTED ||
        application?.status === ApplicationStatus.REVIEWED;
    const canAward =
        canAcceptReject || application?.status === ApplicationStatus.ACCEPTED;
    const canWithdraw =
        application?.status === ApplicationStatus.SUBMITTED ||
        application?.status === ApplicationStatus.REVIEWED ||
        application?.status === ApplicationStatus.ACCEPTED;

    // Check if contract is open (required for award)
    const contractData = application?.contractId as ContractMinimal | undefined;
    const isContractOpen = contractData?.status === ContractStatus.OPEN;

    if (loading) {
        return (
            <ProtectedRoute requireAuth>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                </main>
            </ProtectedRoute>
        );
    }

    if (error || !application) {
        return (
            <ProtectedRoute requireAuth>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Card className="border-destructive">
                        <CardContent className="py-8 text-center">
                            <p className="text-destructive">
                                {error || "Application not found"}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="mt-4"
                            >
                                Go Back
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </ProtectedRoute>
        );
    }

    if (!canViewApplication) {
        return (
            <ProtectedRoute requireAuth>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Card className="border-destructive">
                        <CardContent className="py-8 text-center">
                            <p className="text-destructive">
                                You do not have permission to view this
                                application.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.push("/contracts/my-applications")
                                }
                                className="mt-4"
                            >
                                Go to My Applications
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </ProtectedRoute>
        );
    }

    const vendor = application.vendor;
    const vendorName = getVendorDisplayName(vendor);
    const vendorEmail = vendor?.email || "";
    const vendorContact = vendor?.contactName || "";
    const contractTitle = getContractTitle(application);
    const contractId = getContractId(application);

    return (
        <ProtectedRoute requireAuth>
            <ContractErrorBoundary>
                <motion.main
                    className="container mx-auto max-w-5xl space-y-6 py-6 px-4"
                    variants={pageTransition}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Navigation */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Vendor actions */}
                            {isVendor && canWithdraw && (
                                <Button
                                    variant="outline"
                                    onClick={() => setWithdrawDialogOpen(true)}
                                    disabled={actionLoading}
                                >
                                    <Undo2 className="mr-2 h-4 w-4" />
                                    Withdraw
                                </Button>
                            )}

                            {/* Employee/Admin actions */}
                            <Can anyOf={[P.CONTRACT_MANAGE_APPLICATIONS]}>
                                {canAcceptReject && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setAcceptDialogOpen(true)
                                            }
                                            disabled={actionLoading}
                                            className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Accept
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setRejectDialogOpen(true)
                                            }
                                            disabled={actionLoading}
                                            className="border-destructive text-destructive hover:bg-destructive/10"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </Can>

                            <Can anyOf={[P.CONTRACT_APPROVE]}>
                                {canAward && isContractOpen && (
                                    <Button
                                        onClick={() => setAwardDialogOpen(true)}
                                        disabled={actionLoading}
                                        className="bg-amber-500 hover:bg-amber-600 text-white"
                                    >
                                        <Award className="mr-2 h-4 w-4" />
                                        Award Contract
                                    </Button>
                                )}
                            </Can>

                            {contractId &&
                                (canManageApplications || isAdmin) && (
                                    <Button
                                        variant="outline"
                                        onClick={handleGoToContract}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Contract
                                    </Button>
                                )}
                        </div>
                    </div>

                    {/* Page Header */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Application Details
                            </h1>
                            <StatusBadge
                                type="application"
                                status={application.status}
                            />
                            {isWinner && (
                                <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                >
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Winner
                                </Badge>
                            )}
                        </div>
                        {contractTitle && (
                            <p className="text-muted-foreground">
                                For contract:{" "}
                                <span className="font-medium text-foreground">
                                    {contractTitle}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Proposal Details Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Proposal Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap min-h-[120px] leading-relaxed">
                                        {application.proposalDetails ||
                                            "No proposal details provided."}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Uploaded Documents
                                        {application.documents &&
                                            application.documents.length > 0 &&
                                            ` (${application.documents.length})`}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FileList
                                        files={application.documents || []}
                                        onView={handleViewDocument}
                                        onDownload={handleDownloadDocument}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Vendor Info Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Vendor Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Building className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {vendorName}
                                            </p>
                                            {vendorContact &&
                                                vendorContact !==
                                                    vendorName && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {vendorContact}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                    {vendorEmail && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`mailto:${vendorEmail}`}
                                                className="text-primary hover:underline"
                                            >
                                                {vendorEmail}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Proposed Budget Card */}
                            {application.proposedBudget !== undefined &&
                                application.proposedBudget !== null && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">
                                                Proposed Budget
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <span className="text-2xl font-bold">
                                                    {formatCurrency(
                                                        application.proposedBudget,
                                                    )}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                            {/* Timeline Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <TimelineItem
                                            label="Submitted"
                                            date={
                                                application.applicationDate ||
                                                application.createdAt
                                            }
                                        />
                                        {getStatusTransitionDate(
                                            application.statusHistory,
                                            ApplicationStatus.REVIEWED,
                                        ) && (
                                            <TimelineItem
                                                label="Reviewed"
                                                date={
                                                    getStatusTransitionDate(
                                                        application.statusHistory,
                                                        ApplicationStatus.REVIEWED,
                                                    )!
                                                }
                                            />
                                        )}
                                        {getStatusTransitionDate(
                                            application.statusHistory,
                                            ApplicationStatus.ACCEPTED,
                                        ) && (
                                            <TimelineItem
                                                label="In Review"
                                                date={
                                                    getStatusTransitionDate(
                                                        application.statusHistory,
                                                        ApplicationStatus.ACCEPTED,
                                                    )!
                                                }
                                            />
                                        )}
                                        {getStatusTransitionDate(
                                            application.statusHistory,
                                            ApplicationStatus.AWARDED,
                                        ) && (
                                            <TimelineItem
                                                label="Awarded"
                                                date={
                                                    getStatusTransitionDate(
                                                        application.statusHistory,
                                                        ApplicationStatus.AWARDED,
                                                    )!
                                                }
                                            />
                                        )}
                                        {getStatusTransitionDate(
                                            application.statusHistory,
                                            ApplicationStatus.REJECTED,
                                        ) && (
                                            <TimelineItem
                                                label="Rejected"
                                                date={
                                                    getStatusTransitionDate(
                                                        application.statusHistory,
                                                        ApplicationStatus.REJECTED,
                                                    )!
                                                }
                                            />
                                        )}
                                        {application.withdrawnAt && (
                                            <TimelineItem
                                                label="Withdrawn"
                                                date={application.withdrawnAt}
                                            />
                                        )}
                                        {application.cancelledAt && (
                                            <TimelineItem
                                                label="Cancelled"
                                                date={application.cancelledAt}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Withdrawal/Cancellation Reason */}
                            {(application.withdrawalReason ||
                                application.cancellationReason) && (
                                <Card className="border-amber-200 dark:border-amber-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">
                                            {application.withdrawalReason
                                                ? "Withdrawal Reason"
                                                : "Cancellation Reason"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {application.withdrawalReason ||
                                                application.cancellationReason}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Rejection Reason - shown when application was rejected with a reason */}
                            {application.status ===
                                ApplicationStatus.REJECTED &&
                                getRejectionReason(
                                    application.statusHistory,
                                ) && (
                                    <Card className="border-destructive/50 dark:border-destructive/30">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base text-destructive">
                                                Rejection Reason
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                {getRejectionReason(
                                                    application.statusHistory,
                                                )}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                        </div>
                    </div>

                    {/* Action Dialogs */}
                    <ConfirmDialog
                        open={acceptDialogOpen}
                        onOpenChange={setAcceptDialogOpen}
                        title="Accept Application"
                        description="Are you sure you want to accept this application? This will move it to the review stage."
                        onConfirm={handleAccept}
                        loading={actionLoading}
                    />

                    <RejectDialog
                        open={rejectDialogOpen}
                        onOpenChange={setRejectDialogOpen}
                        onConfirm={handleReject}
                        loading={actionLoading}
                    />

                    <ConfirmDialog
                        open={awardDialogOpen}
                        onOpenChange={setAwardDialogOpen}
                        title="Award Contract"
                        description="Are you sure you want to award this contract to this vendor? This will close the contract and notify all applicants."
                        onConfirm={handleAward}
                        loading={actionLoading}
                    />

                    <ConfirmDialog
                        open={withdrawDialogOpen}
                        onOpenChange={setWithdrawDialogOpen}
                        title="Withdraw Application"
                        description="Are you sure you want to withdraw your application? This action cannot be undone."
                        onConfirm={handleWithdraw}
                        variant="destructive"
                        loading={actionLoading}
                    />
                </motion.main>
            </ContractErrorBoundary>
        </ProtectedRoute>
    );
}

/** Timeline item component */
function TimelineItem({ label, date }: { label: string; date: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">
                    {format(new Date(date), "PPp")}
                </p>
            </div>
        </div>
    );
}
