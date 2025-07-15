"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RBACService } from "@/lib/services/rbac";
import { useUserRoles } from "@/lib/hooks/useRBAC";
import { UserRoleAssignmentDialog } from "@/components/rbac";
import { RBACUser, RBACRole } from "@/lib/types/rbac";
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
    Shield,
    UserMinus,
    Settings,
    AlertTriangle,
    Plus,
} from "lucide-react";

export default function UserRolesPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [removeLoading, setRemoveLoading] = useState<string | null>(null);

    const {
        userRoles,
        loading: rolesLoading,
        error: rolesError,
        refetch,
    } = useUserRoles(userId);

    const handleRemoveRole = async (role: RBACRole) => {
        if (!userRoles || userRoles.totalRoles <= 1) {
            alert("Cannot remove the user's last role");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to remove the "${role.name}" role from this user?`
        );

        if (!confirmed) return;

        setRemoveLoading(role._id);
        try {
            await RBACService.removeRoleFromUser(userId, role._id);
            refetch(); // Refresh the roles list
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to remove role");
        } finally {
            setRemoveLoading(null);
        }
    };

    const handleRolesUpdated = () => {
        refetch(); // Refresh the data
    };

    const getInitials = (user: RBACUser): string => {
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        if (user.fullName) {
            const names = user.fullName.split(" ");
            return names.length > 1
                ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
                : names[0][0].toUpperCase();
        }
        return user.email[0].toUpperCase();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "text-green-600 bg-green-50 border-green-200";
            case "Pending":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "Inactive":
                return "text-gray-600 bg-gray-50 border-gray-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const getAccountTypeColor = (accountType: string) => {
        switch (accountType) {
            case "Admin":
                return "text-blue-600 bg-blue-50 border-blue-200";
            case "Employee":
                return "text-green-600 bg-green-50 border-green-200";
            case "Vendor":
                return "text-purple-600 bg-purple-50 border-purple-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    if (rolesLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/rbac/users")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Users
                    </Button>
                </div>
                <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-2">Loading...</span>
                </div>
            </div>
        );
    }

    if (rolesError || !userRoles) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/rbac/users")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Users
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-destructive">
                            {rolesError || "Failed to load data"}
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentUser = userRoles.user;
    const currentRoles = userRoles.roles;
    const totalRoles = userRoles.totalRoles;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/rbac/users")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Users
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <UserRoleAssignmentDialog
                        user={currentUser}
                        currentRoles={currentRoles}
                        onRolesUpdated={handleRolesUpdated}
                        trigger={
                            <Button>
                                <Plus className="w-4 h-4 mr-1" />
                                Manage Roles
                            </Button>
                        }
                    />
                    <Button asChild variant="outline">
                        <Link href={`/admin/rbac/users/${userId}/permissions`}>
                            <Settings className="w-4 h-4 mr-1" />
                            View Permissions
                        </Link>
                    </Button>
                </div>
            </div>

            {/* User Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                            <AvatarFallback className="text-lg">
                                {getInitials(currentUser)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">
                                {currentUser.fullName ||
                                    `${currentUser.firstName || ""} ${
                                        currentUser.lastName || ""
                                    }`.trim() ||
                                    currentUser.email}
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                {currentUser.email}
                            </CardDescription>
                            <div className="flex items-center space-x-2 mt-3">
                                <Badge
                                    className={getStatusColor(
                                        currentUser.status
                                    )}
                                    variant="outline"
                                >
                                    {currentUser.status}
                                </Badge>
                                <Badge
                                    className={getAccountTypeColor(
                                        currentUser.accountType
                                    )}
                                    variant="outline"
                                >
                                    {currentUser.accountType}
                                </Badge>
                                <Badge variant="outline">
                                    {totalRoles}{" "}
                                    {totalRoles === 1 ? "Role" : "Roles"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {currentUser.lastLogin && (
                        <p className="text-sm text-muted-foreground">
                            Last login:{" "}
                            {new Date(
                                currentUser.lastLogin
                            ).toLocaleDateString()}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Warning for single role */}
            {totalRoles === 1 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2 text-amber-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">
                                Single Role Warning
                            </span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">
                            This user has only one role assigned. Users must
                            have at least one role to maintain system access.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Current Roles */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Current Roles ({totalRoles})</CardTitle>
                            <CardDescription>
                                Roles currently assigned to this user
                            </CardDescription>
                        </div>
                        <UserRoleAssignmentDialog
                            user={currentUser}
                            currentRoles={currentRoles}
                            onRolesUpdated={handleRolesUpdated}
                            trigger={
                                <Button variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add/Remove Roles
                                </Button>
                            }
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {currentRoles.length > 0 ? (
                        <div className="space-y-3">
                            {currentRoles.map((role) => (
                                <div
                                    key={role._id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Shield
                                            className={`w-5 h-5 ${
                                                role.isCustom
                                                    ? "text-green-600"
                                                    : "text-blue-600"
                                            }`}
                                        />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium">
                                                    {role.name}
                                                </h4>
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
                                                <Badge
                                                    variant={
                                                        role.isActive
                                                            ? "outline"
                                                            : "destructive"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {role.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </Badge>
                                            </div>
                                            {role.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {role.description}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                <span>
                                                    {Array.isArray(
                                                        role.permissions
                                                    )
                                                        ? role.permissions
                                                              .length
                                                        : 0}{" "}
                                                    permissions
                                                </span>
                                                {role.createdAt && (
                                                    <span>
                                                        Created:{" "}
                                                        {new Date(
                                                            role.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={`/admin/rbac/roles/${role._id}`}
                                            >
                                                View Role
                                            </Link>
                                        </Button>
                                        {totalRoles > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleRemoveRole(role)
                                                }
                                                disabled={
                                                    removeLoading === role._id
                                                }
                                                className="text-destructive hover:text-destructive"
                                            >
                                                {removeLoading === role._id ? (
                                                    <LoadingSpinner className="w-4 h-4" />
                                                ) : (
                                                    <UserMinus className="w-4 h-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No roles assigned to this user.
                            </p>
                            <UserRoleAssignmentDialog
                                user={currentUser}
                                currentRoles={currentRoles}
                                onRolesUpdated={handleRolesUpdated}
                                trigger={
                                    <Button>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Assign First Role
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
