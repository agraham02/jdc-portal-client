"use client";

import { useEffect, useState } from "react";
import { RBACService } from "@/lib/services/rbac";
import type { CreateRoleRequest, PermissionsResponse } from "@/lib/types/rbac";
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
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

export function CreateRoleDialog({ open, onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [permissionIds, setPermissionIds] = useState<string[]>([]);
    const [permissionsData, setPermissionsData] =
        useState<PermissionsResponse | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        async function load() {
            try {
                const perms = await RBACService.getAllPermissions();
                if (!cancelled) setPermissionsData(perms);
            } catch {
                if (!cancelled) setPermissionsData(null);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [open]);

    const reset = () => {
        setName("");
        setDescription("");
        setPermissionIds([]);
        setError(null);
    };

    const onSubmit = async () => {
        setError(null);
        const nameErr = RBACService.validateRoleName(name);
        if (nameErr) return setError(nameErr);
        const descErr = RBACService.validateRoleDescription(description);
        if (descErr) return setError(descErr);
        const permErr = RBACService.validatePermissions(permissionIds);
        if (permErr) return setError(permErr);

        setSaving(true);
        try {
            const payload: CreateRoleRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                permissions: permissionIds,
            };
            await RBACService.createRole(payload);
            onCreated?.();
            onClose();
            reset();
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : "Failed to create role";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? void 0 : onClose())}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create role</DialogTitle>
                    <DialogDescription>
                        Define a new role and select its permissions.
                    </DialogDescription>
                </DialogHeader>
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
                            placeholder="e.g., Project Manager"
                        />
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
                            placeholder="Optional description"
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
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button onClick={onSubmit} disabled={saving}>
                            Create role
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
