"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { Application, ApplicationStatus } from "@/lib/types/contracts";
import { useNotificationsCtx } from "@/lib/contexts/notifications-context";
import {
    handleContractNotification,
    isContractNotification,
    showContractActionSuccess,
    showContractActionError,
} from "@/lib/utils/contract-notifications";
import { NotificationType } from "@/lib/types/notifications";
import { StatusBadge } from "@/components/common";

export default function MyApplicationsPage() {
    const router = useRouter();
    const { notifications } = useNotificationsCtx();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
        "all"
    );

    const loadMyApplications = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(undefined);
            const response = await ApplicationsService.getMyApplications({
                status: statusFilter === "all" ? undefined : statusFilter,
            });
            setApplications(response.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load applications"
            );
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadMyApplications();
    }, [loadMyApplications]);

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
                onApplicationListUpdate: loadMyApplications,
            });
        }
    }, [notifications, loadMyApplications]);

    async function handleWithdraw(applicationId: string, contractId: string) {
        try {
            await ApplicationsService.withdrawApplication(
                contractId,
                applicationId
            );
            showContractActionSuccess(
                "Application Withdrawn",
                "Your application has been withdrawn successfully"
            );
            await loadMyApplications();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to withdraw application";
            showContractActionError("Withdraw Application", message);
            setError(message);
        }
    }

    function handleViewContract(contractId: string) {
        router.push(`/contracts/${contractId}`);
    }

    const filteredApplications =
        statusFilter === "all"
            ? applications
            : applications.filter((app) => app.status === statusFilter);

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

                {error && (
                    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                        {error}
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
                                                                Contract
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                ID:{" "}
                                                                {application.contractId.slice(
                                                                    -8
                                                                )}
                                                            </p>
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
                                                                    application.submittedAt
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
                                                                        handleWithdraw(
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
            </main>
        </ProtectedRoute>
    );
}
