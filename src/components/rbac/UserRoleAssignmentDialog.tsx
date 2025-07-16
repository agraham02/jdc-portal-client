"use client";

import { useState, useEffect } from "react";
import { RBACRole, RBACUser } from "@/lib/types/rbac";
import { RBACService } from "@/lib/services/rbac";
import { useRoles } from "@/lib/hooks/useRBAC";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Save, X, Shield } from "lucide-react";

interface UserRoleAssignmentDialogProps {
    user: RBACUser;
    currentRoles: RBACRole[];
    onRolesUpdated: (updatedRoles: RBACRole[]) => void;
    trigger?: React.ReactNode;
}

export function UserRoleAssignmentDialog({
    user,
    currentRoles,
    onRolesUpdated,
    trigger,
}: UserRoleAssignmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { roles, loading: rolesLoading } = useRoles();

    // Initialize selected roles when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedRoleIds(currentRoles.map((role) => role._id));
            setError(null);
        }
    }, [open, currentRoles]);

    const handleRoleToggle = (roleId: string, checked: boolean) => {
        if (checked) {
            setSelectedRoleIds((prev) => [...prev, roleId]);
        } else {
            // Prevent removing the last role
            if (selectedRoleIds.length === 1) {
                setError("User must have at least one role assigned");
                return;
            }
            setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
            setError(null);
        }
    };

    const handleSave = async () => {
        if (selectedRoleIds.length === 0) {
            setError("User must have at least one role assigned");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Use bulk update to replace all roles at once
            const response = await RBACService.bulkUpdateUserRoles(user._id, {
                roleIds: selectedRoleIds,
            });

            onRolesUpdated(response.roles);
            setOpen(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update user roles"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasChanges =
        JSON.stringify(selectedRoleIds.sort()) !==
        JSON.stringify(currentRoles.map((r) => r._id).sort());

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-1" />
            Assign Roles
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Manage Roles for {user.fullName || user.email}
                    </DialogTitle>
                    <DialogDescription>
                        Select the roles you want to assign to this user.
                        Changes will take effect immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current User Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">
                                        {user.fullName ||
                                            `${user.firstName || ""} ${
                                                user.lastName || ""
                                            }`.trim() ||
                                            user.email}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline">
                                        {user.accountType}
                                    </Badge>
                                    <Badge variant="outline">
                                        {user.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Role Selection */}
                    {rolesLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                            <span className="ml-2">Loading roles...</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Available Roles</h4>
                                <Badge variant="outline">
                                    {selectedRoleIds.length} selected
                                </Badge>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {roles.map((role) => {
                                    const isSelected = selectedRoleIds.includes(
                                        role._id
                                    );
                                    const isLastRole =
                                        selectedRoleIds.length === 1 &&
                                        isSelected;

                                    return (
                                        <div
                                            key={role._id}
                                            className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                                                isSelected
                                                    ? "bg-muted/30 border-primary/20"
                                                    : ""
                                            }`}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) =>
                                                    handleRoleToggle(
                                                        role._id,
                                                        checked as boolean
                                                    )
                                                }
                                                disabled={isLastRole}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <Shield
                                                        className={`w-4 h-4 ${
                                                            role.isCustom
                                                                ? "text-green-600"
                                                                : "text-blue-600"
                                                        }`}
                                                    />
                                                    <span className="font-medium">
                                                        {role.name}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            role.isCustom
                                                                ? "secondary"
                                                                : "default"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {role.isCustom
                                                            ? "Custom"
                                                            : "System"}
                                                    </Badge>
                                                </div>
                                                {role.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {role.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        {Array.isArray(
                                                            role.permissions
                                                        )
                                                            ? role.permissions
                                                                  .length
                                                            : 0}{" "}
                                                        permissions
                                                    </span>
                                                    {isLastRole && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Cannot remove last
                                                            role
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            {hasChanges
                                ? "You have unsaved changes"
                                : "No changes made"}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                            </Button>

                            <Button
                                onClick={handleSave}
                                disabled={
                                    !hasChanges ||
                                    isSubmitting ||
                                    selectedRoleIds.length === 0
                                }
                            >
                                {isSubmitting && (
                                    <LoadingSpinner className="w-4 h-4 mr-1" />
                                )}
                                <Save className="w-4 h-4 mr-1" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
