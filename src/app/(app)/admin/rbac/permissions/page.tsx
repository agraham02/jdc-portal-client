"use client";

import { useState } from "react";
import { usePermissions } from "@/lib/hooks/useRBAC";
import { PermissionFilters } from "@/lib/types/rbac";
import {
    getPermissionCategory,
    PERMISSION_CATEGORY_LABELS,
    formatPermissionName,
} from "@/lib/constants/permissions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Search, Filter, Key } from "lucide-react";

export default function PermissionsPage() {
    const { permissions, loading, error } = usePermissions();
    const [filters, setFilters] = useState<PermissionFilters>({
        search: "",
        category: undefined,
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2">Loading permissions...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-destructive">
                        Failed to load permissions: {error}
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
        );
    }

    if (!permissions) {
        return null;
    }

    // Filter permissions
    const filteredPermissions = permissions.permissions.filter((permission) => {
        // Category filter
        if (filters.category) {
            const category = getPermissionCategory(permission.name);
            if (category !== filters.category) return false;
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                permission.name.toLowerCase().includes(searchLower) ||
                permission.description?.toLowerCase().includes(searchLower) ||
                formatPermissionName(permission.name)
                    .toLowerCase()
                    .includes(searchLower)
            );
        }

        return true;
    });

    // Group filtered permissions by category
    const categorizedFilteredPermissions = filteredPermissions.reduce(
        (acc, permission) => {
            const category = getPermissionCategory(permission.name);
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(permission);
            return acc;
        },
        {} as Record<string, typeof permissions.permissions>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">
                    System Permissions
                </h2>
                <p className="text-muted-foreground">
                    View all available permissions in the system (
                    {permissions.totalPermissions} total)
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Total Permissions
                            </div>
                            <Badge variant="outline">
                                {permissions.totalPermissions}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Categories
                            </div>
                            <Badge variant="outline">
                                {Object.keys(permissions.categorized).length}
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
                                {filteredPermissions.length}
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
                                placeholder="Search permissions..."
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

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Category:
                                </span>
                            </div>
                            <Badge
                                variant={
                                    !filters.category ? "default" : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        category: undefined,
                                    }))
                                }
                            >
                                All Categories ({permissions.totalPermissions})
                            </Badge>
                            {Object.entries(permissions.categorized).map(
                                ([category, categoryPermissions]) => (
                                    <Badge
                                        key={category}
                                        variant={
                                            filters.category === category
                                                ? "default"
                                                : "outline"
                                        }
                                        className="cursor-pointer"
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                category:
                                                    filters.category ===
                                                    category
                                                        ? undefined
                                                        : category,
                                            }))
                                        }
                                    >
                                        {PERMISSION_CATEGORY_LABELS[category] ||
                                            category}{" "}
                                        ({categoryPermissions.length})
                                    </Badge>
                                )
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions by Category */}
            {Object.keys(categorizedFilteredPermissions).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(categorizedFilteredPermissions).map(
                        ([category, categoryPermissions]) => (
                            <Card key={category}>
                                <CardHeader>
                                    <div className="flex items-center space-x-2">
                                        <Key className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-xl">
                                            {PERMISSION_CATEGORY_LABELS[
                                                category
                                            ] || category}
                                        </CardTitle>
                                        <Badge variant="secondary">
                                            {categoryPermissions.length}{" "}
                                            permissions
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Permissions related to{" "}
                                        {(
                                            PERMISSION_CATEGORY_LABELS[
                                                category
                                            ] || category
                                        ).toLowerCase()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categoryPermissions.map(
                                            (permission) => (
                                                <div
                                                    key={permission._id}
                                                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-start justify-between">
                                                            <h4 className="font-medium text-sm">
                                                                {formatPermissionName(
                                                                    permission.name
                                                                )}
                                                            </h4>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    permission.name
                                                                }
                                                            </Badge>
                                                        </div>
                                                        {permission.description && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    permission.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center">
                        <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                            No permissions found matching your filters.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setFilters({ search: "", category: undefined })
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
