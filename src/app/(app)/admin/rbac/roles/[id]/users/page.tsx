"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RBACService } from "@/lib/services/rbac";
import { useRoleUsers } from "@/lib/hooks/useRBAC";
import { RBACRole, RBACUser } from "@/lib/types/rbac";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Search,
    Users,
    UserMinus,
    Settings,
    Shield,
} from "lucide-react";

export default function RoleUsersPage() {
    const params = useParams();
    const router = useRouter();
    const roleId = params.id as string;

    const [role, setRole] = useState<RBACRole | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);
    const [roleError, setRoleError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [removeLoading, setRemoveLoading] = useState<string | null>(null);

    const {
        roleUsers,
        loading: usersLoading,
        error: usersError,
        refetch,
    } = useRoleUsers(roleId);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const data = await RBACService.getRoleById(roleId);
                setRole(data);
            } catch (err) {
                setRoleError(
                    err instanceof Error ? err.message : "Failed to fetch role"
                );
            } finally {
                setRoleLoading(false);
            }
        };

        if (roleId) {
            fetchRole();
        }
    }, [roleId]);

    const handleRemoveUser = async (user: RBACUser) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove "${
                user.fullName || user.email
            }" from the role "${role?.name}"?`
        );

        if (!confirmed) return;

        setRemoveLoading(user._id);
        try {
            await RBACService.removeRoleFromUser(user._id, roleId);
            refetch(); // Refresh the users list
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to remove user from role"
            );
        } finally {
            setRemoveLoading(null);
        }
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

    // Filter users based on search query
    const filteredUsers =
        roleUsers?.users.filter((user) => {
            if (!searchQuery) return true;

            const searchLower = searchQuery.toLowerCase();
            return (
                user.email.toLowerCase().includes(searchLower) ||
                user.firstName?.toLowerCase().includes(searchLower) ||
                user.lastName?.toLowerCase().includes(searchLower) ||
                user.fullName?.toLowerCase().includes(searchLower)
            );
        }) || [];

    if (roleLoading || usersLoading) {
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
                <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-2">Loading...</span>
                </div>
            </div>
        );
    }

    if (roleError || usersError || !role || !roleUsers) {
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
                            {roleError || usersError || "Failed to load data"}
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

    const totalUsers = roleUsers.totalUsers;
    const canRemoveUsers = role.isCustom; // Only allow removing users from custom roles

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            router.push(`/admin/rbac/roles/${role._id}`)
                        }
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Role Details
                    </Button>
                </div>
                <Button asChild variant="outline">
                    <Link href="/admin/rbac/users">
                        <Users className="w-4 h-4 mr-1" />
                        Manage All Users
                    </Link>
                </Button>
            </div>

            {/* Role Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        <Shield
                            className={`w-6 h-6 ${
                                role.isCustom
                                    ? "text-green-600"
                                    : "text-blue-600"
                            }`}
                        />
                        <div>
                            <CardTitle className="text-xl">
                                Users with Role: {role.name}
                            </CardTitle>
                            <CardDescription>
                                {role.description ||
                                    "Manage users assigned to this role"}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Total Users:
                            </span>
                            <Badge variant="outline">{totalUsers}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                                Role Type:
                            </span>
                            <Badge
                                variant={
                                    role.isCustom ? "secondary" : "default"
                                }
                            >
                                {role.isCustom ? "Custom" : "System"}
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                                Filtered Results:
                            </span>
                            <Badge variant="outline">
                                {filteredUsers.length}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <Card
                            key={user._id}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start space-x-3">
                                    <Avatar>
                                        <AvatarFallback>
                                            {getInitials(user)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-lg truncate">
                                            {user.fullName ||
                                                `${user.firstName || ""} ${
                                                    user.lastName || ""
                                                }`.trim() ||
                                                user.email}
                                        </CardTitle>
                                        <CardDescription className="truncate">
                                            {user.email}
                                        </CardDescription>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Badge
                                                className={getStatusColor(
                                                    user.status
                                                )}
                                                variant="outline"
                                            >
                                                {user.status}
                                            </Badge>
                                            <Badge
                                                className={getAccountTypeColor(
                                                    user.accountType
                                                )}
                                                variant="outline"
                                            >
                                                {user.accountType}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {/* Role Info */}
                                {user.totalRoles !== undefined && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Total Roles:
                                        </span>
                                        <Badge variant="outline">
                                            {user.totalRoles}
                                        </Badge>
                                    </div>
                                )}

                                {/* Last Login */}
                                {user.lastLogin && (
                                    <div className="text-xs text-muted-foreground">
                                        Last login:{" "}
                                        {new Date(
                                            user.lastLogin
                                        ).toLocaleDateString()}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Link
                                            href={`/admin/rbac/users/${user._id}/roles`}
                                        >
                                            <Settings className="w-4 h-4 mr-1" />
                                            Manage
                                        </Link>
                                    </Button>

                                    {canRemoveUsers &&
                                        user.totalRoles &&
                                        user.totalRoles > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleRemoveUser(user)
                                                }
                                                disabled={
                                                    removeLoading === user._id
                                                }
                                                className="text-destructive hover:text-destructive"
                                            >
                                                {removeLoading === user._id ? (
                                                    <LoadingSpinner className="w-4 h-4" />
                                                ) : (
                                                    <UserMinus className="w-4 h-4" />
                                                )}
                                            </Button>
                                        )}
                                </div>

                                {/* Warning for last role */}
                                {user.totalRoles === 1 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded text-xs p-2">
                                        <span className="text-amber-800">
                                            Cannot remove user&apos;s last role
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                            {searchQuery
                                ? "No users found matching your search."
                                : "No users assigned to this role."}
                        </p>
                        {searchQuery && (
                            <Button
                                variant="outline"
                                onClick={() => setSearchQuery("")}
                            >
                                Clear Search
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
