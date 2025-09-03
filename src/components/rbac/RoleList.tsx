"use client";

import { useEffect, useMemo, useState } from "react";
import { RBACService } from "@/lib/services/rbac";
import type { RBACRole } from "@/lib/types/rbac";
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
import { CreateRoleDialog } from "./CreateRoleDialog";
import { EditRoleDialog } from "./EditRoleDialog";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useAuthz } from "@/lib/authz/useAuthz";

type Kind = "all" | "system" | "custom";

export function RoleList() {
    const { hasAny } = useAuthz();
    const canManage = hasAny([P.RBAC_ROLE_MANAGE]);

    const [roles, setRoles] = useState<RBACRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [kind, setKind] = useState<Kind>("all");

    const [createOpen, setCreateOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await RBACService.getAllRoles();
            setRoles(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const data = await RBACService.getAllRoles();
                if (!cancelled) setRoles(data);
            } catch (e) {
                if (!cancelled)
                    setError(
                        e instanceof Error ? e.message : "Failed to load roles"
                    );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return roles.filter((r) => {
            const kPass =
                kind === "all"
                    ? true
                    : kind === "custom"
                    ? !!r.isCustom
                    : !r.isCustom;
            const qPass =
                !q ||
                r.name.toLowerCase().includes(q) ||
                (r.description ?? "").toLowerCase().includes(q);
            return kPass && qPass;
        });
    }, [roles, query, kind]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Search roles"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-64"
                />
                <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex-1" />
                {canManage && (
                    <Button onClick={() => setCreateOpen(true)}>
                        New role
                    </Button>
                )}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Permissions</TableHead>
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
                                    No roles
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((r) => {
                                const permCount = Array.isArray(r.permissions)
                                    ? r.permissions.length
                                    : 0;
                                const type = r.isCustom ? "Custom" : "System";
                                return (
                                    <TableRow key={r._id}>
                                        <TableCell className="font-medium">
                                            {r.name}
                                        </TableCell>
                                        <TableCell className="max-w-[420px] truncate text-muted-foreground">
                                            {r.description ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    r.isCustom
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                            >
                                                {type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{permCount}</TableCell>
                                        <TableCell className="text-right">
                                            {canManage && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setEditId(r._id);
                                                        setEditOpen(true);
                                                    }}
                                                >
                                                    Edit
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

            <CreateRoleDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={load}
            />
            <EditRoleDialog
                roleId={editId}
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onUpdated={load}
            />
        </div>
    );
}
