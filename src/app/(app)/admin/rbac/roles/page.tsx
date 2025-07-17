"use client";

import { useState } from "react";
import Link from "next/link";
import { useRoles } from "@/lib/hooks/useRBAC";
import { RoleFilters } from "@/lib/types/rbac";
import { RoleCard } from "@/components/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Filter } from "lucide-react";

export default function RolesPage() {
    const { roles, loading, error } = useRoles();
    const [filters, setFilters] = useState<RoleFilters>({
        type: "all",
        status: "all",
        search: "",
    });

    // Filter roles based on current filters
    const filteredRoles = roles.filter((role) => {
        // Type filter
        if (filters.type === "system" && role.isCustom) return false;
        if (filters.type === "custom" && !role.isCustom) return false;

        // Status filter
        if (filters.status === "active" && !role.isActive) return false;
        if (filters.status === "inactive" && role.isActive) return false;

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                role.name.toLowerCase().includes(searchLower) ||
                role.description?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const systemRoles = roles.filter((role) => !role.isCustom);
    const customRoles = roles.filter((role) => role.isCustom);
    const activeRoles = roles.filter((role) => role.isActive);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2">Loading roles...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-destructive">
                        Failed to load roles: {error}
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Role Management
                    </h2>
                    <p className="text-muted-foreground">
                        Manage system and custom roles
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/rbac/roles/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Role
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Total Roles
                            </div>
                            <Badge variant="outline">{roles.length}</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                System Roles
                            </div>
                            <Badge variant="outline">
                                {systemRoles.length}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Custom Roles
                            </div>
                            <Badge variant="outline">
                                {customRoles.length}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                                Active Roles
                            </div>
                            <Badge variant="outline">
                                {activeRoles.length}
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
                                placeholder="Search roles..."
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

                        {/* Filter Badges */}
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Type:
                                </span>
                            </div>
                            <Badge
                                variant={
                                    filters.type === "all"
                                        ? "default"
                                        : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        type: "all",
                                    }))
                                }
                            >
                                All ({roles.length})
                            </Badge>
                            <Badge
                                variant={
                                    filters.type === "system"
                                        ? "default"
                                        : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        type: "system",
                                    }))
                                }
                            >
                                System ({systemRoles.length})
                            </Badge>
                            <Badge
                                variant={
                                    filters.type === "custom"
                                        ? "default"
                                        : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        type: "custom",
                                    }))
                                }
                            >
                                Custom ({customRoles.length})
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1">
                                <span className="text-sm text-muted-foreground">
                                    Status:
                                </span>
                            </div>
                            <Badge
                                variant={
                                    filters.status === "all"
                                        ? "default"
                                        : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        status: "all",
                                    }))
                                }
                            >
                                All
                            </Badge>
                            <Badge
                                variant={
                                    filters.status === "active"
                                        ? "default"
                                        : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        status: "active",
                                    }))
                                }
                            >
                                Active
                            </Badge>
                            <Badge
                                variant={
                                    filters.status === "inactive"
                                        ? "default"
                                        : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        status: "inactive",
                                    }))
                                }
                            >
                                Inactive
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Roles Grid */}
            {filteredRoles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoles.map((role) => (
                        <RoleCard
                            key={role._id}
                            role={role}
                            onEdit={(role) => {
                                // Navigate to edit page
                                window.location.href = `/admin/rbac/roles/${role._id}/edit`;
                            }}
                            onViewUsers={(role) => {
                                // Navigate to role users page
                                window.location.href = `/admin/rbac/roles/${role._id}/users`;
                            }}
                            onDelete={async (role) => {
                                if (
                                    window.confirm(
                                        `Are you sure you want to delete the role "${role.name}"?`
                                    )
                                ) {
                                    // This would trigger a deletion - we'll implement this with proper state management
                                    console.log("Delete role:", role._id);
                                }
                            }}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground mb-4">
                            {filters.search ||
                            filters.type !== "all" ||
                            filters.status !== "all"
                                ? "No roles found matching your filters."
                                : "No roles found."}
                        </p>
                        {filters.type === "custom" && (
                            <Button asChild>
                                <Link href="/admin/rbac/roles/create">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Custom Role
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
