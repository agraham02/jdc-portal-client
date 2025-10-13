"use client";

import { useEffect, useMemo, useState } from "react";
import { RBACService } from "@/lib/services/rbac";
import type {
    RBACRole,
    PermissionsResponse,
    UpdateRoleRequest,
} from "@/lib/types/rbac";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PermissionSelector } from "./PermissionSelector";

type Props = {
    roleId: string | null;
    open: boolean;
    onClose: () => void;
    onUpdated?: () => void;
};

export function EditRoleDialog({ roleId, open, onClose, onUpdated }: Props) {
    const [loading, setLoading] = useState(false);
    const [permissionsData, setPermissionsData] =
        useState<PermissionsResponse | null>(null);
    const [role, setRole] = useState<RBACRole | null>(null);
    const [roleUserCount, setRoleUserCount] = useState<number>(0);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [permissionIds, setPermissionIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [archiving, setArchiving] = useState(false);

    useEffect(() => {
        if (!open || !roleId) return;
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const ensuredId = roleId as string; // non-null due to guard
                const [perms, roleResp] = await Promise.all([
                    RBACService.getAllPermissions(),
                    RBACService.getRoleById(ensuredId),
                ]);
                if (cancelled) return;
                setPermissionsData(perms);
                setRole(roleResp);
                setName(roleResp.name);
                setDescription(roleResp.description ?? "");
                function getPermissionId(p: unknown): string {
                    if (typeof p === "string") return p;
                    if (
                        typeof p === "object" &&
                        p !== null &&
                        "_id" in (p as Record<string, unknown>)
                    ) {
                        const id = (p as { _id?: unknown })._id;
                        return typeof id === "string" ? id : "";
                    }
                    return "";
                }
                const ids = Array.isArray(roleResp.permissions)
                    ? roleResp.permissions.map(getPermissionId).filter(Boolean)
                    : [];
                setPermissionIds(ids);
                // fetch users with this role to guard deletion
                try {
                    const usersResp = await RBACService.getRoleUsers(ensuredId);
                    if (!cancelled) setRoleUserCount(usersResp.totalUsers ?? 0);
                } catch {
                    if (!cancelled) setRoleUserCount(0);
                }
            } catch (e) {
                if (!cancelled)
                    setError(
                        e instanceof Error ? e.message : "Failed to load role"
                    );
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [open, roleId]);

    // TODO add role.isSystem field in backend
    const isSystemRole = useMemo(() => {
        const n = role?.name;
        return (
            n === "Admin" ||
            n === "Employee" ||
            n === "Vendor" ||
            n === "Management" ||
            n === "External Affairs" ||
            n === "HR"
        );
    }, [role]);

    const onSubmit = async () => {
        if (!roleId) return;
        setError(null);
        const nameErr = RBACService.validateRoleName(name);
        if (nameErr) return setError(nameErr);
        const descErr = RBACService.validateRoleDescription(description);
        if (descErr) return setError(descErr);
        const permErr = RBACService.validatePermissions(permissionIds);
        if (permErr) return setError(permErr);

        setSaving(true);
        try {
            const payload: UpdateRoleRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                permissionIds,
            };
            await RBACService.updateRole(roleId, payload);
            onUpdated?.();
            onClose();
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : "Failed to update role";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const onArchive = async () => {
        if (!roleId) return;
        setArchiving(true);
        setError(null);
        try {
            await RBACService.archiveRole(roleId);
            onUpdated?.();
            onClose();
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : "Failed to archive role";
            setError(msg);
        } finally {
            setArchiving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? void 0 : onClose())}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit role</DialogTitle>
                    <DialogDescription>
                        Update role details and assigned permissions.
                    </DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="py-6 text-sm text-muted-foreground">
                        Loading…
                    </div>
                ) : (
                    <div className="space-y-4">
                        {error && (
                            <div className="text-sm text-red-600">{error}</div>
                        )}
                        <div className="grid gap-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="role-name"
                            >
                                Name
                            </label>
                            <Input
                                id="role-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={saving || isSystemRole}
                            />
                            {isSystemRole && (
                                <div className="text-xs text-muted-foreground">
                                    System roles cannot be renamed.
                                </div>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="role-desc"
                            >
                                Description
                            </label>
                            <Textarea
                                id="role-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Permissions
                            </label>
                            <PermissionSelector
                                permissionsData={permissionsData}
                                value={permissionIds}
                                onChange={setPermissionIds}
                                disabled={saving}
                            />
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="destructive"
                                    onClick={onArchive}
                                    disabled={
                                        archiving ||
                                        isSystemRole ||
                                        roleUserCount > 0
                                    }
                                    title={
                                        isSystemRole
                                            ? "System roles cannot be archived"
                                            : roleUserCount > 0
                                            ? "Cannot archive a role assigned to users"
                                            : undefined
                                    }
                                >
                                    Archive role
                                </Button>
                                {(isSystemRole || roleUserCount > 0) && (
                                    <div className="text-xs text-muted-foreground">
                                        {isSystemRole
                                            ? "Protected system roles cannot be archived."
                                            : "Remove this role from all users before archiving."}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={onSubmit} disabled={saving}>
                                    Save changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
