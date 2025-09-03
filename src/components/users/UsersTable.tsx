"use client";

import { useEffect, useMemo, useState } from "react";
import { RBACService } from "@/lib/services/rbac";
import type { RBACRole, RBACUser } from "@/lib/types/rbac";
import { UserStatus } from "@/lib/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { AuthService } from "@/lib/services/auth";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useAuthz } from "@/lib/authz/useAuthz";

type StatusFilter = "all" | "Active" | "Pending" | "Inactive";

export function UsersTable() {
    const { hasAny } = useAuthz();
    const canActivate = hasAny([P.USER_ACTIVATE]);

    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<RBACRole[]>([]);
    const [users, setUsers] = useState<RBACUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [roleId, setRoleId] = useState<string>("all");

    const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const openDrawer = (id: string) => {
        setDrawerUserId(id);
        setDrawerOpen(true);
    };

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [allRoles, rbacUsers] = await Promise.all([
                    RBACService.getAllRoles(),
                    RBACService.getUsersWithRoles(),
                ]);
                if (cancelled) return;
                setRoles(allRoles);
                setUsers(rbacUsers);
            } catch (e) {
                if (!cancelled)
                    setError(
                        e instanceof Error ? e.message : "Failed to load users"
                    );
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    // Track Admin role users to prevent removal of last admin via deactivation
    const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
    useEffect(() => {
        let cancelled = false;
        async function loadAdmins() {
            const admin = roles.find((r) => r.name === "Admin");
            if (!admin) {
                setAdminUserIds(new Set());
                return;
            }
            try {
                const resp = await RBACService.getRoleUsers(admin._id);
                if (cancelled) return;
                setAdminUserIds(new Set(resp.users.map((u) => u._id)));
            } catch {
                if (!cancelled) setAdminUserIds(new Set());
            }
        }
        loadAdmins();
        return () => {
            cancelled = true;
        };
    }, [roles]);

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const sPass = status === "all" || u.status === status;
            const rPass =
                roleId === "all" ||
                (Array.isArray(u.roles) &&
                    u.roles.some((r) => {
                        if (typeof r === "string") return r === roleId;
                        return (r as unknown as { _id: string })._id === roleId;
                    }));
            const q = query.trim().toLowerCase();
            const qPass =
                !q ||
                [u.email, u.firstName, u.lastName]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q));
            return sPass && rPass && qPass;
        });
    }, [users, status, roleId, query]);

    const [busyId, setBusyId] = useState<string | null>(null);

    const doDeactivate = async (userId: string) => {
        if (!canActivate) return;
        setBusyId(userId);
        try {
            await AuthService.deactivateUser(userId);
            setUsers(
                (prev) =>
                    prev.map((u) =>
                        u._id === userId
                            ? { ...u, status: UserStatus.INACTIVE }
                            : u
                    ) as RBACUser[]
            );
        } finally {
            setBusyId(null);
        }
    };

    const doReactivate = async (userId: string) => {
        if (!canActivate) return;
        setBusyId(userId);
        try {
            await AuthService.reactivateUser(userId);
            setUsers(
                (prev) =>
                    prev.map((u) =>
                        u._id === userId
                            ? { ...u, status: UserStatus.ACTIVE }
                            : u
                    ) as RBACUser[]
            );
        } finally {
            setBusyId(null);
        }
    };

    const doUnlock = async (userId: string) => {
        if (!canActivate) return;
        setBusyId(userId);
        try {
            await AuthService.unlockUser(userId);
        } finally {
            setBusyId(null);
        }
    };

    // Pagination (client-side)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filtered.slice(start, end);

    const isLastAdmin = (userId: string) =>
        adminUserIds.has(userId) && adminUserIds.size === 1;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
                <Input
                    placeholder="Search name or email"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-64"
                    aria-label="Search users"
                />
                <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as StatusFilter)}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={roleId} onValueChange={setRoleId}>
                    <SelectTrigger className="w-56">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        {roles.map((r) => (
                            <SelectItem key={r._id} value={r._id}>
                                {r.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                        setPageSize(Number(v));
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-28">
                        <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-sm text-muted-foreground"
                                >
                                    Loading…
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-sm text-muted-foreground"
                                >
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageItems.map((u) => {
                                const name =
                                    u.firstName || u.lastName
                                        ? `${u.firstName ?? ""} ${
                                              u.lastName ?? ""
                                          }`.trim()
                                        : u.email;
                                const roleCount = Array.isArray(u.roles)
                                    ? u.roles.length
                                    : 0;
                                const st = u.status;
                                return (
                                    <TableRow key={u._id}>
                                        <TableCell>{name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {u.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    st === "Active"
                                                        ? "default"
                                                        : st === "Pending"
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                            >
                                                {st}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{roleCount}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    openDrawer(u._id)
                                                }
                                            >
                                                Manage roles
                                            </Button>
                                            {canActivate && st === "Active" && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        doDeactivate(u._id)
                                                    }
                                                    disabled={
                                                        busyId === u._id ||
                                                        isLastAdmin(u._id)
                                                    }
                                                >
                                                    Deactivate
                                                </Button>
                                            )}
                                            {canActivate &&
                                                st === "Inactive" && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() =>
                                                            doReactivate(u._id)
                                                        }
                                                        disabled={
                                                            busyId === u._id
                                                        }
                                                    >
                                                        Reactivate
                                                    </Button>
                                                )}
                                            {canActivate && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        doUnlock(u._id)
                                                    }
                                                    disabled={busyId === u._id}
                                                >
                                                    Unlock
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    Showing {Math.min(total, start + 1)}-{Math.min(total, end)}{" "}
                    of {total}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                    >
                        Previous
                    </Button>
                    <div>
                        Page {currentPage} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <UserDetailDrawer
                userId={drawerUserId}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    );
}
