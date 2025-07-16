"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RBACService } from "@/lib/services/rbac";
import { RBACUser, UserFilters } from "@/lib/types/rbac";
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
import { Search, Users, UserCheck, Settings } from "lucide-react";

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<RBACUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<UserFilters>({
        search: "",
        status: undefined,
        accountType: undefined,
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await RBACService.getUsersWithRoles();
                setUsers(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to fetch users"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users
    const filteredUsers = users.filter((user) => {
        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                user.email.toLowerCase().includes(searchLower) ||
                user.firstName?.toLowerCase().includes(searchLower) ||
                user.lastName?.toLowerCase().includes(searchLower) ||
                user.fullName?.toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        if (filters.status && user.status !== filters.status) {
            return false;
        }

        // Account type filter
        if (filters.accountType && user.accountType !== filters.accountType) {
            return false;
        }

        return true;
    });

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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2">Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-destructive">
                        Failed to load users: {error}
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.refresh()}
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const uniqueStatuses = [...new Set(users.map((u) => u.status))];
    const uniqueAccountTypes = [...new Set(users.map((u) => u.accountType))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">
                    User Role Management
                </h2>
                <p className="text-muted-foreground">
                    Manage user roles and permissions ({users.length} total
                    users)
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Total Users
                            </div>
                            <Badge variant="outline">{users.length}</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Active Users
                            </div>
                            <Badge variant="outline">
                                {
                                    users.filter((u) => u.status === "Active")
                                        .length
                                }
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Admins
                            </div>
                            <Badge variant="outline">
                                {
                                    users.filter(
                                        (u) => u.accountType === "Admin"
                                    ).length
                                }
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Filtered Results
                            </div>
                            <Badge variant="outline">
                                {filteredUsers.length}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        search: e.target.value,
                                    }))
                                }
                                className="pl-10"
                            />
                        </div>

                        {/* Filter Options */}
                        <div className="flex flex-wrap gap-4">
                            {/* Status Filter */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Status:
                                </span>
                                <Badge
                                    variant={
                                        !filters.status ? "default" : "outline"
                                    }
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: undefined,
                                        }))
                                    }
                                >
                                    All
                                </Badge>
                                {uniqueStatuses.map((status) => (
                                    <Badge
                                        key={status}
                                        variant={
                                            filters.status === status
                                                ? "default"
                                                : "outline"
                                        }
                                        className="cursor-pointer"
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                status:
                                                    filters.status === status
                                                        ? undefined
                                                        : status,
                                            }))
                                        }
                                    >
                                        {status}
                                    </Badge>
                                ))}
                            </div>

                            {/* Account Type Filter */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Type:
                                </span>
                                <Badge
                                    variant={
                                        !filters.accountType
                                            ? "default"
                                            : "outline"
                                    }
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            accountType: undefined,
                                        }))
                                    }
                                >
                                    All
                                </Badge>
                                {uniqueAccountTypes.map(
                                    (accountType, index) => (
                                        <Badge
                                            key={`${accountType}${index}`}
                                            variant={
                                                filters.accountType ===
                                                accountType
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    accountType:
                                                        filters.accountType ===
                                                        accountType
                                                            ? undefined
                                                            : accountType,
                                                }))
                                            }
                                        >
                                            {accountType}
                                        </Badge>
                                    )
                                )}
                            </div>
                        </div>
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
                                            Assigned Roles:
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
                                            <UserCheck className="w-4 h-4 mr-1" />
                                            Manage Roles
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={`/admin/rbac/users/${user._id}/permissions`}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                            No users found matching your filters.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setFilters({
                                    search: "",
                                    status: undefined,
                                    accountType: undefined,
                                })
                            }
                        >
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
