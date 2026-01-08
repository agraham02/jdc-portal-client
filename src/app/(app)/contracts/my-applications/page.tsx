"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Eye, Calendar, FileText } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ApplicationsService } from "@/lib/services/contracts";
import { PermissionName as P } from "@/lib/constants/permission-names";
import type {
    ApplicationStatus,
    ApplicationListResponse,
} from "@/lib/types/contracts";
import { useNotificationsCtx } from "@/lib/contexts/notifications-context";
import {
    handleContractNotification,
    isContractNotification,
    showContractActionSuccess,
    showContractActionError,
} from "@/lib/utils/contract-notifications";
import { NotificationType } from "@/lib/types/notifications";
import { StatusBadge } from "@/components/common";
import { usePaginatedApi } from "@/lib/hooks/useApi";
import { ConfirmDialog } from "@/components/contracts/ConfirmDialog";

export default function MyApplicationsPage() {
    const router = useRouter();
    const { notifications } = useNotificationsCtx();
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
        "all"
    );
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
    const [selectedWithdraw, setSelectedWithdraw] = useState<{
        applicationId: string;
        contractId: string;
    } | null>(null);

    // Fetch applications with SWR
    const {
        data: response,
        error,
        isLoading,
        mutate: revalidate,
    } = usePaginatedApi<ApplicationListResponse>(
        "/contract-applications/my-applications",
        statusFilter === "all" ? {} : { status: statusFilter }
    );

    // Extract applications from response
    const applications = response?.data || [];

    // Listen for application status change notifications
    useEffect(() => {
        const latestNotification = notifications[0];
        if (
            !latestNotification ||
            !isContractNotification(latestNotification.type)
        ) {
            return;
        }

        // Refresh list when application status changes
        if (
            latestNotification.type === NotificationType.APPLICATION_ACCEPTED ||
            latestNotification.type === NotificationType.APPLICATION_REJECTED ||
            latestNotification.type ===
                NotificationType.APPLICATION_CANCELLED ||
            latestNotification.type === NotificationType.APPLICATION_WITHDRAWN
        ) {
            handleContractNotification(latestNotification, {
                onApplicationListUpdate: () => revalidate(),
            });
        }
    }, [notifications, revalidate]);

    function openWithdrawDialog(applicationId: string, contractId: string) {
        setSelectedWithdraw({ applicationId, contractId });
        setWithdrawDialogOpen(true);
    }

    async function handleWithdraw() {
        if (!selectedWithdraw) return;
        try {
            await ApplicationsService.withdrawApplication(
                selectedWithdraw.applicationId
            );
            showContractActionSuccess(
                "Application Withdrawn",
                "Your application has been withdrawn successfully"
            );
            setWithdrawDialogOpen(false);
            setSelectedWithdraw(null);
            // Revalidate the cache to refresh the list
            await revalidate();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to withdraw application";
            showContractActionError("Withdraw Application", message);
        }
    }

    function handleViewContract(contractId: string) {
        router.push(`/contracts/${contractId}`);
    }

    // Since we're filtering by status in the API call, no need for client-side filtering
    const filteredApplications = applications;

    const errorMessage =
        error instanceof Error
            ? error.message
            : error
            ? "Failed to load applications"
            : undefined;

    return (
        <ProtectedRoute anyOf={[P.CONTRACT_APPLY]}>
            <main className="container mx-auto space-y-6 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Applications</h1>
                        <p className="mt-2 text-muted-foreground">
                            Track the status of your contract applications
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/contracts")}
                    >
                        Browse Contracts
                    </Button>
                </div>

                {errorMessage && (
                    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                        {errorMessage}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Applications ({filteredApplications.length})
                            </CardTitle>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(
                                        value as ApplicationStatus | "all"
                                    )
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="Submitted">
                                        Submitted
                                    </SelectItem>
                                    <SelectItem value="Reviewed">
                                        Reviewed
                                    </SelectItem>
                                    <SelectItem value="Accepted">
                                        Accepted
                                    </SelectItem>
                                    <SelectItem value="Rejected">
                                        Rejected
                                    </SelectItem>
                                    <SelectItem value="Withdrawn">
                                        Withdrawn
                                    </SelectItem>
                                    <SelectItem value="Cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-12 animate-pulse rounded bg-muted" />
                                <div className="h-12 animate-pulse rounded bg-muted" />
                                <div className="h-12 animate-pulse rounded bg-muted" />
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">
                                    No applications found
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {statusFilter === "all"
                                        ? "You haven't applied to any contracts yet."
                                        : `No applications with status "${statusFilter}".`}
                                </p>
                                <Button
                                    onClick={() => router.push("/contracts")}
                                >
                                    Browse Available Contracts
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Contract</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Proposal</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApplications.map(
                                            (application) => (
                                                <TableRow key={application._id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">
                                                                {application
                                                                    .contract
                                                                    ?.title ||
                                                                    "Unknown Contract"}
                                                            </p>
                                                            {application
                                                                .contract
                                                                ?.status && (
                                                                <StatusBadge
                                                                    type="contract"
                                                                    status={
                                                                        application
                                                                            .contract
                                                                            .status
                                                                    }
                                                                    showIcon={
                                                                        false
                                                                    }
                                                                    className="mt-1"
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            type="application"
                                                            status={
                                                                application.status
                                                            }
                                                            showIcon={false}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    application.applicationDate ||
                                                                        application.submittedAt ||
                                                                        application.createdAt
                                                                ),
                                                                {
                                                                    addSuffix:
                                                                        true,
                                                                }
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="max-w-md truncate text-sm">
                                                            {
                                                                application.proposalDetails
                                                            }
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleViewContract(
                                                                        application.contractId
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            {(application.status ===
                                                                "Submitted" ||
                                                                application.status ===
                                                                    "Reviewed") && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openWithdrawDialog(
                                                                            application._id,
                                                                            application.contractId
                                                                        )
                                                                    }
                                                                >
                                                                    Withdraw
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Withdraw Confirmation Dialog */}
                <ConfirmDialog
                    open={withdrawDialogOpen}
                    onOpenChange={setWithdrawDialogOpen}
                    title="Withdraw Application"
                    description="Are you sure you want to withdraw this application? This action cannot be undone."
                    onConfirm={handleWithdraw}
                    variant="destructive"
                />
            </main>
        </ProtectedRoute>
    );
}
