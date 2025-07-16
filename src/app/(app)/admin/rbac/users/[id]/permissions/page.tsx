"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUserRoles } from "@/lib/hooks/useRBAC";
import { RBACUser, RBACRole } from "@/lib/types/rbac";
import {
    PERMISSION_CATEGORY_LABELS,
    getPermissionCategory,
    formatPermissionName,
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
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Shield,
    Search,
    AlertTriangle,
    Users,
    Eye,
} from "lucide-react";

export default function UserPermissionsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const { userRoles, loading, error } = useUserRoles(userId);

    // Compute effective permissions from all roles
    const effectivePermissions =
        userRoles?.roles.reduce((acc: string[], role: RBACRole) => {
            const rolePermissions = Array.isArray(role.permissions)
                ? role.permissions
                : [];
            rolePermissions.forEach((permission) => {
                const permissionStr =
                    typeof permission === "string"
                        ? permission
                        : permission.name || "";
                if (permissionStr && !acc.includes(permissionStr)) {
                    acc.push(permissionStr);
                }
            });
            return acc;
        }, []) || [];

    // Group permissions by category
    const permissionsByCategory = effectivePermissions.reduce(
        (acc: Record<string, string[]>, permission: string) => {
            const categoryKey = getPermissionCategory(permission);
            const categoryName =
                PERMISSION_CATEGORY_LABELS[categoryKey] || "Other";

            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(permission);
            return acc;
        },
        {}
    );

    // Available categories for filtering
    const availableCategories = Object.keys(PERMISSION_CATEGORY_LABELS).map(
        (key) => ({
            key,
            name: PERMISSION_CATEGORY_LABELS[key],
        })
    );

    // Filter permissions based on search and category
    const filteredCategories = Object.entries(permissionsByCategory).filter(
        ([categoryName, permissions]) => {
            if (
                selectedCategory !== "all" &&
                categoryName !== selectedCategory
            ) {
                return false;
            }

            if (!searchTerm) return true;

            return permissions.some(
                (permission) =>
                    formatPermissionName(permission)
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    categoryName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }
    );

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

    const getCategoryIcon = () => {
        // Simple mapping since we don't have the full category definitions
        return Shield; // Default to Shield icon
    };

    const getCategoryColor = (categoryName: string) => {
        // Simple color mapping
        const colors: Record<string, string> = {
            "User Management": "text-blue-600",
            "Employee Operations": "text-green-600",
            "Vendor Management": "text-purple-600",
            "Contract Handling": "text-orange-600",
            "File Operations": "text-cyan-600",
            "RBAC Management": "text-red-600",
            "System Administration": "text-gray-600",
        };
        return colors[categoryName] || "text-gray-600";
    };

    if (loading) {
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

    if (error || !userRoles) {
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
                            {error || "Failed to load data"}
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
    const totalPermissions = effectivePermissions.length;

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
                    <Button asChild variant="outline">
                        <Link href={`/admin/rbac/users/${userId}/roles`}>
                            <Users className="w-4 h-4 mr-1" />
                            Manage Roles
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
                                    {userRoles.totalRoles}{" "}
                                    {userRoles.totalRoles === 1
                                        ? "Role"
                                        : "Roles"}
                                </Badge>
                                <Badge variant="outline">
                                    {totalPermissions}{" "}
                                    {totalPermissions === 1
                                        ? "Permission"
                                        : "Permissions"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Roles Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Roles Summary</CardTitle>
                    <CardDescription>
                        Roles that contribute to this user&apos;s permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {currentRoles.map((role) => (
                            <Link
                                key={role._id}
                                href={`/admin/rbac/roles/${role._id}`}
                                className="inline-block"
                            >
                                <Badge
                                    variant={
                                        role.isActive
                                            ? "secondary"
                                            : "destructive"
                                    }
                                    className="cursor-pointer hover:opacity-80"
                                >
                                    <Shield className="w-3 h-3 mr-1" />
                                    {role.name}
                                    <span className="ml-1 text-xs opacity-70">
                                        (
                                        {Array.isArray(role.permissions)
                                            ? role.permissions.length
                                            : 0}
                                        )
                                    </span>
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Warning for no permissions */}
            {totalPermissions === 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2 text-amber-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">No Permissions</span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">
                            This user has no effective permissions. They may not
                            be able to access any system features.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                Effective Permissions ({totalPermissions})
                            </CardTitle>
                            <CardDescription>
                                All permissions inherited from assigned roles
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search permissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {availableCategories.map((category) => (
                                <option
                                    key={category.key}
                                    value={category.name}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Permissions by Category */}
                    {totalPermissions > 0 ? (
                        <div className="space-y-6">
                            {filteredCategories.map(
                                ([categoryName, permissions]) => {
                                    const CategoryIcon = getCategoryIcon();
                                    return (
                                        <div
                                            key={categoryName}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <CategoryIcon
                                                    className={`w-5 h-5 ${getCategoryColor(
                                                        categoryName
                                                    )}`}
                                                />
                                                <h4 className="text-lg font-semibold">
                                                    {categoryName}
                                                </h4>
                                                <Badge variant="outline">
                                                    {permissions.length}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-7">
                                                {permissions
                                                    .filter(
                                                        (permission) =>
                                                            !searchTerm ||
                                                            formatPermissionName(
                                                                permission
                                                            )
                                                                .toLowerCase()
                                                                .includes(
                                                                    searchTerm.toLowerCase()
                                                                )
                                                    )
                                                    .map((permission) => (
                                                        <div
                                                            key={permission}
                                                            className="p-3 bg-muted/50 rounded-lg border"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium">
                                                                    {formatPermissionName(
                                                                        permission
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {permission}
                                                            </p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No permissions found.
                            </p>
                            <Button asChild>
                                <Link
                                    href={`/admin/rbac/users/${userId}/roles`}
                                >
                                    <Users className="w-4 h-4 mr-1" />
                                    Assign Roles
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
