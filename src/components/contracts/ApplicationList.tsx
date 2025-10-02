"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Eye,
    CheckCircle,
    XCircle,
    MoreVertical,
    User,
    Calendar,
} from "lucide-react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "./StatusChip";
import { ConfirmDialog } from "./ConfirmDialog";
import { Can } from "@/components/authz/Can";
import { PermissionName } from "@/lib/constants/permission-names";
import { cn } from "@/lib/utils";
import type {
    Application,
    ApplicationStatus,
    Contract,
} from "@/lib/types/contracts";

interface ApplicationListProps {
    contract: Contract;
    applications: Application[];
    isLoading?: boolean;
    onAccept?: (applicationId: string) => Promise<void>;
    onReject?: (applicationId: string) => Promise<void>;
    onViewDetails?: (applicationId: string) => void;
    className?: string;
}

export function ApplicationList({
    applications,
    isLoading = false,
    onAccept,
    onReject,
    onViewDetails,
    className,
}: ApplicationListProps) {
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
        "all"
    );
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<
        string | null
    >(null);

    const filteredApplications =
        statusFilter === "all"
            ? applications
            : applications.filter((app) => app.status === statusFilter);

    const handleAccept = async () => {
        if (selectedApplicationId && onAccept) {
            await onAccept(selectedApplicationId);
            setAcceptDialogOpen(false);
            setSelectedApplicationId(null);
        }
    };

    const handleReject = async () => {
        if (selectedApplicationId && onReject) {
            await onReject(selectedApplicationId);
            setRejectDialogOpen(false);
            setSelectedApplicationId(null);
        }
    };

    const openAcceptDialog = (applicationId: string) => {
        setSelectedApplicationId(applicationId);
        setAcceptDialogOpen(true);
    };

    const openRejectDialog = (applicationId: string) => {
        setSelectedApplicationId(applicationId);
        setRejectDialogOpen(true);
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Applications ({applications.length})</CardTitle>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                            setStatusFilter(value as ApplicationStatus | "all")
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Reviewed">Reviewed</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {filteredApplications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <User className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">
                            No applications found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {statusFilter === "all"
                                ? "No vendors have applied to this contract yet."
                                : `No applications with status "${statusFilter}".`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Proposal</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((application) => (
                                    <TableRow key={application._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {typeof application.vendor ===
                                                        "object"
                                                            ? `${application.vendor.firstName} ${application.vendor.lastName}`
                                                            : "Unknown Vendor"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {typeof application.vendor ===
                                                        "object"
                                                            ? application.vendor
                                                                  .email
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip
                                                status={application.status}
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
                                                        addSuffix: true,
                                                    }
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="max-w-md truncate text-sm">
                                                {application.proposalDetails}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        onViewDetails?.(
                                                            application._id
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Can
                                                    anyOf={[
                                                        PermissionName.CONTRACT_MANAGE_APPLICATIONS,
                                                    ]}
                                                >
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {application.status ===
                                                                "Submitted" ||
                                                            application.status ===
                                                                "Reviewed" ? (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openAcceptDialog(
                                                                                application._id
                                                                            )
                                                                        }
                                                                    >
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        Accept
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openRejectDialog(
                                                                                application._id
                                                                            )
                                                                        }
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Reject
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : null}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </Can>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Accept Dialog */}
            <ConfirmDialog
                open={acceptDialogOpen}
                onOpenChange={setAcceptDialogOpen}
                title="Accept Application"
                description="Are you sure you want to accept this application? This action will notify the vendor."
                onConfirm={handleAccept}
            />

            {/* Reject Dialog */}
            <ConfirmDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                title="Reject Application"
                description="Are you sure you want to reject this application? This action will notify the vendor."
                onConfirm={handleReject}
                variant="destructive"
            />
        </Card>
    );
}
