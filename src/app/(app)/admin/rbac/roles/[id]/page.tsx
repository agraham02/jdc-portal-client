"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RBACService } from "@/lib/services/rbac";
import { useRoleUsers } from "@/lib/hooks/useRBAC";
import { RBACRole, RBACPermission } from "@/lib/types/rbac";
import {
    getPermissionCategory,
    PERMISSION_CATEGORY_LABELS,
    formatPermissionName,
    SYSTEM_ROLES,
} from "@/lib/constants/permissions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Users,
    Shield,
    Key,
    Calendar,
    AlertTriangle,
} from "lucide-react";

export default function RoleDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const roleId = params.id as string;

    const [role, setRole] = useState<RBACRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { roleUsers, loading: usersLoading } = useRoleUsers(roleId);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const data = await RBACService.getRoleById(roleId);
                setRole(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to fetch role"
                );
            } finally {
                setLoading(false);
            }
        };

        if (roleId) {
            fetchRole();
        }
    }, [roleId]);

    const handleDelete = async () => {
        if (!role || !role.isCustom) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        setDeleteLoading(true);
        try {
            await RBACService.archiveRole(role._id);
            router.push("/admin/rbac/roles");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete role");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2">Loading role...</span>
            </div>
        );
    }

    if (error || !role) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/rbac/roles")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Roles
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-destructive">
                            {error || "Role not found"}
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push("/admin/rbac/roles")}
                        >
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isSystemRole = SYSTEM_ROLES.includes(
        role.name as (typeof SYSTEM_ROLES)[number]
    );
    const permissions = Array.isArray(role.permissions) ? role.permissions : [];
    const permissionCount = permissions.length;

    // Group permissions by category
    const categorizedPermissions = permissions.reduce((acc, permission) => {
        const permissionObj =
            typeof permission === "string"
                ? { _id: permission, name: permission }
                : permission;
        const category = getPermissionCategory(permissionObj.name);
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permissionObj);
        return acc;
    }, {} as Record<string, RBACPermission[]>);

    const userCount = roleUsers?.totalUsers || 0;
    const canDelete = role.isCustom && userCount === 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/rbac/roles")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Roles
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    {role.isCustom && (
                        <Button asChild variant="outline">
                            <Link href={`/admin/rbac/roles/${role._id}/edit`}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit Role
                            </Link>
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href={`/admin/rbac/roles/${role._id}/users`}>
                            <Users className="w-4 h-4 mr-1" />
                            View Users ({userCount})
                        </Link>
                    </Button>
                    {canDelete && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <LoadingSpinner className="w-4 h-4 mr-1" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            Delete Role
                        </Button>
                    )}
                </div>
            </div>

            {/* Role Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Shield
                                className={`w-8 h-8 ${
                                    isSystemRole
                                        ? "text-blue-600"
                                        : "text-green-600"
                                }`}
                            />
                            <div>
                                <CardTitle className="text-2xl">
                                    {role.name}
                                </CardTitle>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Badge
                                        variant={
                                            isSystemRole
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {isSystemRole
                                            ? "System Role"
                                            : "Custom Role"}
                                    </Badge>
                                    <Badge
                                        variant={
                                            role.isActive
                                                ? "outline"
                                                : "destructive"
                                        }
                                    >
                                        {role.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {role.description && (
                        <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-muted-foreground">
                                {role.description}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                            <Key className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Permissions:
                            </span>
                            <Badge variant="outline">{permissionCount}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Assigned Users:
                            </span>
                            <Badge variant="outline">{userCount}</Badge>
                        </div>
                        {role.createdAt && (
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Created:
                                </span>
                                <span className="text-sm">
                                    {new Date(
                                        role.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {!canDelete && role.isCustom && userCount > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                            <div className="flex items-center space-x-2 text-amber-800">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Cannot delete role with assigned users
                                </span>
                            </div>
                            <p className="text-sm text-amber-700 mt-1">
                                Remove all users from this role before deletion.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assigned Users Preview */}
            {!usersLoading && roleUsers && roleUsers.users.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Assigned Users ({userCount})</CardTitle>
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={`/admin/rbac/roles/${role._id}/users`}
                                >
                                    View All
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {roleUsers.users.slice(0, 6).map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center space-x-3 p-3 border rounded-lg"
                                >
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="text-xs">
                                            {user.firstName && user.lastName
                                                ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                                                : user.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">
                                            {user.fullName ||
                                                `${user.firstName || ""} ${
                                                    user.lastName || ""
                                                }`.trim() ||
                                                user.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {userCount > 6 && (
                            <div className="text-center mt-4">
                                <Button asChild variant="outline">
                                    <Link
                                        href={`/admin/rbac/roles/${role._id}/users`}
                                    >
                                        View {userCount - 6} More Users
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Permissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Permissions ({permissionCount})</CardTitle>
                    <CardDescription>
                        All permissions granted by this role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {Object.keys(categorizedPermissions).length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(categorizedPermissions).map(
                                ([category, categoryPermissions]) => (
                                    <div key={category}>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Key className="w-4 h-4 text-primary" />
                                            <h4 className="font-medium">
                                                {PERMISSION_CATEGORY_LABELS[
                                                    category
                                                ] || category}
                                            </h4>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {categoryPermissions.length}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                                            {categoryPermissions.map(
                                                (permission) => (
                                                    <div
                                                        key={permission._id}
                                                        className="p-2 border rounded bg-muted/30"
                                                    >
                                                        <div className="text-sm font-medium">
                                                            {formatPermissionName(
                                                                permission.name
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {permission.description ||
                                                                permission.name}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                No permissions assigned to this role.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
