"use client";

import { useEffect, useMemo, useState } from "react";
import { RBACService } from "@/lib/services/rbac";
import type { RBACRole, UserRolesResponse } from "@/lib/types/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Props = {
    userId: string | null;
    onClose?: () => void;
    trigger: React.ReactNode;
};

export function UserDetailModal({ userId, onClose, trigger }: Props) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<RBACRole[]>([]);
    const [userRoles, setUserRoles] = useState<UserRolesResponse | null>(null);
    const [addRoleId, setAddRoleId] = useState<string>("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open || !userId) return;
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const checkedUserId = userId;
                const [allRoles, userRolesResp] = await Promise.all([
                    RBACService.getAllRoles(),
                    checkedUserId
                        ? RBACService.getUserRoles(checkedUserId)
                        : Promise.resolve(null),
                ]);
                if (cancelled) return;
                setRoles(allRoles.data);
                setUserRoles(userRolesResp);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    const availableRoles = useMemo(() => {
        const currentIds = new Set<string>(
            (userRoles?.roles || []).map((r) => r._id)
        );
        return roles.filter((r) => !currentIds.has(r._id));
    }, [roles, userRoles]);

    const handleAddRole = async () => {
        if (!userId || !addRoleId) return;
        setSaving(true);
        try {
            const updated = await RBACService.assignRoleToUser(userId, {
                roleId: addRoleId,
            });
            setUserRoles(updated);
            setAddRoleId("");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveRole = async (roleId: string) => {
        if (!userId) return;
        setSaving(true);
        try {
            const updated = await RBACService.removeRoleFromUser(
                userId,
                roleId
            );
            setUserRoles(updated);
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to remove role"
            );
        } finally {
            setSaving(false);
        }
    };

    const user = userRoles?.user;

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>User details</DialogTitle>
                    <DialogDescription>
                        View user profile basics and manage roles.
                    </DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="py-6 text-sm text-muted-foreground">
                        Loading…
                    </div>
                ) : user ? (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <div className="text-base font-medium">
                                {user.firstName || user.lastName
                                    ? `${user.firstName ?? ""} ${
                                          user.lastName ?? ""
                                      }`.trim()
                                    : user.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {user.email}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium mb-2">
                                Roles
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(userRoles?.roles || []).map((r) => (
                                    <Badge
                                        key={r._id}
                                        variant="secondary"
                                        className="flex items-center gap-2"
                                    >
                                        {r.name}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-1 text-xs"
                                            onClick={() =>
                                                handleRemoveRole(r._id)
                                            }
                                            disabled={saving}
                                            aria-label={`Remove role ${r.name}`}
                                        >
                                            ✕
                                        </Button>
                                    </Badge>
                                ))}
                                {userRoles?.roles?.length === 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        No roles
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Select
                                value={addRoleId}
                                onValueChange={setAddRoleId}
                            >
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Add role…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map((r) => (
                                        <SelectItem key={r._id} value={r._id}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleAddRole}
                                disabled={!addRoleId || saving}
                            >
                                Add role
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 text-sm text-muted-foreground">
                        No user selected
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
