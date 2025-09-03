"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Can } from "@/components/authz/Can";
import { useAuthz } from "@/lib/authz/useAuthz";
import { ApprovalsService } from "@/lib/services/approvals";
import type { User } from "@/lib/types/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type PageState = {
    page: number;
    pageSize: number;
    search: string;
    status: "Pending" | "All";
};

export default function ApprovalsPage() {
    const { loading: authzLoading, hasAny } = useAuthz();
    const canDecide = hasAny("user:activate");
    const { toast } = useToast();
    const [pageState, setPageState] = useState<PageState>({
        page: 1,
        pageSize: 25,
        search: "",
        status: "Pending",
    });
    const [data, setData] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [rejecting, setRejecting] = useState<{
        id: string;
        email: string;
    } | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await ApprovalsService.getPendingAccounts(
                pageState.page,
                pageState.pageSize
            );
            let users = resp.data;
            // Client-side search filter (backend endpoint supports only pending list)
            if (pageState.search) {
                const q = pageState.search.toLowerCase();
                users = users.filter(
                    (u) =>
                        u.email.toLowerCase().includes(q) ||
                        (u.firstName || "").toLowerCase().includes(q) ||
                        (u.lastName || "").toLowerCase().includes(q)
                );
            }
            setData(users);
            setTotal(resp.total);
        } catch (e: any) {
            toast({
                title: "Failed to load pending accounts",
                description: e?.message || "",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [pageState.page, pageState.pageSize, pageState.search, toast]);

    useEffect(() => {
        if (!authzLoading) void load();
    }, [authzLoading, load]);

    const onApprove = useCallback(
        async (u: User) => {
            setBusyId(u._id);
            try {
                await ApprovalsService.approveAccount(u._id);
                toast({ title: `Approved ${u.email}` });
                // Optimistic update: remove from list
                setData((prev) => prev.filter((x) => x._id !== u._id));
                setTotal((t) => Math.max(0, t - 1));
            } catch (e: any) {
                toast({
                    title: "Approval failed",
                    description: e?.message || "",
                    variant: "destructive",
                });
            } finally {
                setBusyId(null);
            }
        },
        [toast]
    );

    const onReject = useCallback(async () => {
        if (!rejecting) return;
        setBusyId(rejecting.id);
        try {
            await ApprovalsService.rejectAccount(
                rejecting.id,
                rejectReason || undefined
            );
            toast({ title: `Rejected ${rejecting.email}` });
            setData((prev) => prev.filter((x) => x._id !== rejecting.id));
            setTotal((t) => Math.max(0, t - 1));
            setRejecting(null);
            setRejectReason("");
        } catch (e: any) {
            toast({
                title: "Rejection failed",
                description: e?.message || "",
                variant: "destructive",
            });
        } finally {
            setBusyId(null);
        }
    }, [rejecting, rejectReason, toast]);

    const pages = useMemo(() => {
        return Math.max(1, Math.ceil(total / pageState.pageSize));
    }, [total, pageState.pageSize]);

    return (
        <Can
            anyOf={["user:activate", "employee:read:all", "vendor:read:all"]}
            fallback={<div>Access denied.</div>}
        >
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold">Account Approvals</h1>
                <Card className="p-4 space-y-4">
                    <div className="flex gap-2 flex-wrap items-center">
                        <Input
                            placeholder="Search by name or email"
                            value={pageState.search}
                            onChange={(e) =>
                                setPageState((s) => ({
                                    ...s,
                                    search: e.target.value,
                                    page: 1,
                                }))
                            }
                            className="max-w-xs"
                        />
                        <Select
                            value={pageState.pageSize.toString()}
                            onValueChange={(v) =>
                                setPageState((s) => ({
                                    ...s,
                                    pageSize: Number(v) || 25,
                                    page: 1,
                                }))
                            }
                        >
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={() => load()} variant="secondary">
                            Refresh
                        </Button>
                    </div>
                    <Separator />
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <div className="overflow-auto">
                            <Table data-testid="approvals-table">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    No pending accounts.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((u) => {
                                            const name =
                                                u.firstName || u.lastName
                                                    ? `${u.firstName || ""} ${
                                                          u.lastName || ""
                                                      }`.trim()
                                                    : "—";
                                            const roles = Array.isArray(u.roles)
                                                ? (u.roles as any[])
                                                      .map((r) =>
                                                          typeof r === "string"
                                                              ? r
                                                              : r?.name || ""
                                                      )
                                                      .filter(Boolean)
                                                      .join(", ")
                                                : "";
                                            return (
                                                <TableRow key={u._id}>
                                                    <TableCell>
                                                        {name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {u.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {roles}
                                                    </TableCell>
                                                    <TableCell>
                                                        {canDecide ? (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    disabled={
                                                                        busyId ===
                                                                        u._id
                                                                    }
                                                                    onClick={() =>
                                                                        onApprove(
                                                                            u
                                                                        )
                                                                    }
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    disabled={
                                                                        busyId ===
                                                                        u._id
                                                                    }
                                                                    onClick={() =>
                                                                        setRejecting(
                                                                            {
                                                                                id: u._id,
                                                                                email: u.email,
                                                                            }
                                                                        )
                                                                    }
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                        <div>
                            Showing {data.length} of {total} pending
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pageState.page <= 1 || loading}
                                onClick={() =>
                                    setPageState((s) => ({
                                        ...s,
                                        page: Math.max(1, s.page - 1),
                                    }))
                                }
                            >
                                Prev
                            </Button>
                            <span>
                                Page {pageState.page} / {pages}
                            </span>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pageState.page >= pages || loading}
                                onClick={() =>
                                    setPageState((s) => ({
                                        ...s,
                                        page: Math.min(pages, s.page + 1),
                                    }))
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Reject dialog */}
                {rejecting && (
                    <Dialog
                        open
                        onOpenChange={(open) => !open && setRejecting(null)}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{`Reject ${rejecting.email}`}</DialogTitle>
                                <DialogDescription>
                                    Optionally provide a reason to help the
                                    requester understand what to change.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 py-2">
                                <label className="text-sm font-medium">
                                    Reason (optional)
                                </label>
                                <Input
                                    placeholder="e.g., Please include your company website"
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="secondary"
                                    onClick={() => setRejecting(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={busyId === rejecting.id}
                                    onClick={() => void onReject()}
                                >
                                    Confirm Reject
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </Can>
    );
}
