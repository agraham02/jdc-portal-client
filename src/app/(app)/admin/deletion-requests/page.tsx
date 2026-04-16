"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/lib/services/auth";
import { toast } from "sonner";
import { AlertTriangle, Check, X } from "lucide-react";

interface DeletionRequest {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    status: string;
    deleteRequestedAt?: string;
    roles?: Array<{ name?: string }>;
}

export default function DeletionRequestsPage() {
    const [page, setPage] = useState(1);
    const { data, error, isLoading, mutate } = useSWR(
        ["deletion-requests", page],
        () => AuthService.listPendingDeletions(page, 25),
        { revalidateOnFocus: false },
    );

    const [busyId, setBusyId] = useState<string | null>(null);

    const refresh = useCallback(() => {
        mutate();
    }, [mutate]);

    async function handleApprove(id: string) {
        setBusyId(id);
        try {
            const res = await AuthService.approveDeletion(id);
            toast.success(
                `Scheduled for ${new Date(res.scheduledFor).toLocaleDateString()}${
                    res.orphanedReports
                        ? ` — ${res.orphanedReports} report(s) orphaned`
                        : ""
                }`,
            );
            refresh();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast.error(err.message || "Failed to approve deletion");
        } finally {
            setBusyId(null);
        }
    }

    async function handleCancel(id: string) {
        setBusyId(id);
        try {
            await AuthService.cancelDeletion(id);
            toast.success("Deletion request cancelled");
            refresh();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast.error(err.message || "Failed to cancel deletion");
        } finally {
            setBusyId(null);
        }
    }

    useEffect(() => {
        if (error) {
            toast.error("Failed to load deletion requests");
        }
    }, [error]);

    const requests = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / 25));

    return (
        <main className="p-6 max-w-6xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <AlertTriangle className="h-7 w-7 text-amber-500" />
                    Account Deletion Requests
                </h1>
                <p className="text-muted-foreground mt-1">
                    Review and approve or deny pending account-deletion
                    requests. Approving schedules anonymization after the
                    configured grace window.
                </p>
            </motion.div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                        {total} request{total === 1 ? "" : "s"} awaiting
                        decision
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-muted-foreground text-sm">
                            Loading...
                        </p>
                    ) : requests.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No pending deletion requests.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((r: DeletionRequest) => (
                                    <TableRow key={r._id}>
                                        <TableCell className="font-medium">
                                            {[r.firstName, r.lastName]
                                                .filter(Boolean)
                                                .join(" ") || "—"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {r.email}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {(r.roles ?? []).map(
                                                    (role, i) =>
                                                        role.name ? (
                                                            <Badge
                                                                key={i}
                                                                variant="secondary"
                                                            >
                                                                {role.name}
                                                            </Badge>
                                                        ) : null,
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {r.deleteRequestedAt
                                                ? new Date(
                                                      r.deleteRequestedAt,
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleCancel(r._id)
                                                    }
                                                    disabled={busyId === r._id}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Deny
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleApprove(r._id)
                                                    }
                                                    disabled={busyId === r._id}
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
