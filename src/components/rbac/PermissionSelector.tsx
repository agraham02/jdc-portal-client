"use client";

import { useState } from "react";
import { RBACPermission, PermissionFilters } from "@/lib/types/rbac";
import {
    getPermissionCategory,
    PERMISSION_CATEGORY_LABELS,
    formatPermissionName,
} from "@/lib/constants/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

interface PermissionSelectorProps {
    permissions: RBACPermission[];
    selectedPermissionIds: string[];
    onChange: (permissionIds: string[]) => void;
    disabled?: boolean;
}

export function PermissionSelector({
    permissions,
    selectedPermissionIds,
    onChange,
    disabled = false,
}: PermissionSelectorProps) {
    const [filters, setFilters] = useState<PermissionFilters>({
        search: "",
        category: undefined,
    });

    // Group permissions by category
    const categorizedPermissions = permissions.reduce((acc, permission) => {
        const category = getPermissionCategory(permission.name);
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {} as Record<string, RBACPermission[]>);

    // Filter permissions based on search and category
    const filteredCategorizedPermissions = Object.keys(
        categorizedPermissions
    ).reduce((acc, category) => {
        if (filters.category && category !== filters.category) {
            return acc;
        }

        const categoryPermissions = categorizedPermissions[category].filter(
            (permission) => {
                if (!filters.search) return true;

                const searchLower = filters.search.toLowerCase();
                return (
                    permission.name.toLowerCase().includes(searchLower) ||
                    permission.description
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    formatPermissionName(permission.name)
                        .toLowerCase()
                        .includes(searchLower)
                );
            }
        );

        if (categoryPermissions.length > 0) {
            acc[category] = categoryPermissions;
        }

        return acc;
    }, {} as Record<string, RBACPermission[]>);

    const handlePermissionToggle = (permissionId: string, checked: boolean) => {
        if (disabled) return;

        if (checked) {
            onChange([...selectedPermissionIds, permissionId]);
        } else {
            onChange(selectedPermissionIds.filter((id) => id !== permissionId));
        }
    };

    const handleCategoryToggle = (category: string, checked: boolean) => {
        if (disabled) return;

        const categoryPermissionIds = categorizedPermissions[category].map(
            (p) => p._id
        );

        if (checked) {
            // Add all category permissions that aren't already selected
            const newSelections = categoryPermissionIds.filter(
                (id) => !selectedPermissionIds.includes(id)
            );
            onChange([...selectedPermissionIds, ...newSelections]);
        } else {
            // Remove all category permissions
            onChange(
                selectedPermissionIds.filter(
                    (id) => !categoryPermissionIds.includes(id)
                )
            );
        }
    };

    const getCategorySelectionState = (category: string) => {
        const categoryPermissionIds = categorizedPermissions[category].map(
            (p) => p._id
        );
        const selectedInCategory = categoryPermissionIds.filter((id) =>
            selectedPermissionIds.includes(id)
        );

        if (selectedInCategory.length === 0) return false;
        if (selectedInCategory.length === categoryPermissionIds.length)
            return true;
        return "indeterminate";
    };

    const selectedCount = selectedPermissionIds.length;
    const totalCount = permissions.length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label className="text-base font-medium">Permissions</Label>
                    <p className="text-sm text-muted-foreground">
                        Select permissions for this role ({selectedCount} of{" "}
                        {totalCount} selected)
                    </p>
                </div>
                <Badge variant="secondary">{selectedCount} selected</Badge>
            </div>

            {/* Search Filter */}
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

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={!filters.category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                        setFilters((prev) => ({ ...prev, category: undefined }))
                    }
                >
                    All Categories
                </Badge>
                {Object.keys(categorizedPermissions).map((category) => (
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
                                    filters.category === category
                                        ? undefined
                                        : category,
                            }))
                        }
                    >
                        {PERMISSION_CATEGORY_LABELS[category] || category}
                    </Badge>
                ))}
            </div>

            {/* Permission Categories */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(filteredCategorizedPermissions).map(
                    ([category, categoryPermissions]) => {
                        const selectionState =
                            getCategorySelectionState(category);

                        return (
                            <Card key={category}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={selectionState === true}
                                            onCheckedChange={(
                                                checked: boolean
                                            ) =>
                                                handleCategoryToggle(
                                                    category,
                                                    checked
                                                )
                                            }
                                            disabled={disabled}
                                            ref={(ref) => {
                                                if (
                                                    ref &&
                                                    selectionState ===
                                                        "indeterminate"
                                                ) {
                                                    ref.indeterminate = true;
                                                }
                                            }}
                                        />
                                        <CardTitle className="text-lg">
                                            {PERMISSION_CATEGORY_LABELS[
                                                category
                                            ] || category}
                                        </CardTitle>
                                        <Badge variant="outline">
                                            {categoryPermissions.length}{" "}
                                            permissions
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {categoryPermissions.map(
                                            (permission) => (
                                                <div
                                                    key={permission._id}
                                                    className="flex items-start space-x-2 p-2 rounded border hover:bg-muted/50"
                                                >
                                                    <Checkbox
                                                        checked={selectedPermissionIds.includes(
                                                            permission._id
                                                        )}
                                                        onCheckedChange={(
                                                            checked: boolean
                                                        ) =>
                                                            handlePermissionToggle(
                                                                permission._id,
                                                                checked
                                                            )
                                                        }
                                                        disabled={disabled}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <Label className="text-sm font-medium cursor-pointer">
                                                            {formatPermissionName(
                                                                permission.name
                                                            )}
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {permission.description ||
                                                                permission.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }
                )}
            </div>

            {Object.keys(filteredCategorizedPermissions).length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">
                            No permissions found matching your filters.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
