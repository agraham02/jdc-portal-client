"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";
import {
    GenericTable,
    type GenericTableConfig,
    useTableState,
} from "@/components/ui/generic-table";
import { usePaginatedApi } from "@/lib/hooks/useApi";
import { HrDocumentsService } from "@/lib/services/file";
import { HrCategory, HrCategoryListResponse } from "@/lib/types/file";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusIcon } from "lucide-react";
import { apiToast } from "@/lib/utils/toast-helpers";
import { errorMessages, successMessages } from "@/lib/utils/error-messages";
import { cn } from "@/lib/utils";
import { HrCategoryFormDialog } from "./HrCategoryFormDialog";

/**
 * HR Categories management table with full CRUD support
 * Uses GenericTable for consistent UI and SWR for data fetching
 */
export function HrCategoriesTable() {
    // Dialog state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<HrCategory | null>(
        null
    );
    const [deletingCategory, setDeletingCategory] = useState<HrCategory | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter definitions for the table
    const filterDefinitions = useMemo<
        GenericTableConfig<HrCategory>["filters"]
    >(
        () => [
            {
                key: "search",
                label: "Search",
                type: "search",
                placeholder: "Search categories...",
                className: "w-64",
            },
            {
                key: "isActive",
                label: "Status",
                type: "select",
                className: "w-32",
                options: [
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                ],
            },
        ],
        []
    );

    // Table state management
    const tableState = useTableState({
        filters: filterDefinitions,
        defaultPageSize: 25,
    });

    const { page, pageSize, filters: activeFilters } = tableState;

    // Extract filter values
    const searchFilter = activeFilters.search?.trim() ?? "";
    const statusFilter =
        activeFilters.isActive && activeFilters.isActive !== "all"
            ? activeFilters.isActive === "true"
            : undefined;

    // Defer search to prevent UI jank
    const deferredSearch = useDeferredValue(searchFilter);
    const isSearchStale = searchFilter !== deferredSearch;

    // Build query params - only include defined values
    const queryParams: Record<string, string | number | boolean> = {
        page,
        limit: pageSize,
    };
    if (deferredSearch) {
        queryParams.search = deferredSearch;
    }
    if (statusFilter !== undefined) {
        queryParams.isActive = statusFilter;
    }

    // SWR data fetching with automatic caching and revalidation
    const { data, error, isLoading, mutate } =
        usePaginatedApi<HrCategoryListResponse>(
            "/hr-documents/categories",
            queryParams
        );

    const categories = data?.categories ?? [];
    const totalCategories = data?.total ?? 0;

    // Refresh data
    const handleRefresh = useCallback(() => {
        mutate();
    }, [mutate]);

    // Handle category deletion with optimistic update
    const handleDelete = async () => {
        if (!deletingCategory) return;
        const categoryToDelete = deletingCategory;

        // Close dialog immediately
        setDeletingCategory(null);
        setIsDeleting(true);

        // Optimistic update: immediately remove from cache
        mutate(
            (current) =>
                current
                    ? {
                          ...current,
                          categories: current.categories.filter(
                              (c) => c._id !== categoryToDelete._id
                          ),
                          total: current.total - 1,
                      }
                    : current,
            { revalidate: false }
        );

        try {
            await HrDocumentsService.deleteCategory(categoryToDelete._id);
            apiToast.success(successMessages.hrCategories.deleted);
            // Revalidate to ensure consistency
            mutate();
        } catch (e: unknown) {
            // Revert optimistic update on error
            mutate();
            apiToast.error(errorMessages.hrCategories.delete, e);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle dialog success - refresh data
    const handleDialogSuccess = useCallback(() => {
        mutate();
    }, [mutate]);

    // Table configuration
    const tableConfig: GenericTableConfig<HrCategory> = useMemo(
        () => ({
            columns: [
                {
                    key: "name",
                    label: "Name",
                    render: (cat) => (
                        <span className="font-medium">{cat.name}</span>
                    ),
                },
                {
                    key: "slug",
                    label: "Slug",
                    render: (cat) => (
                        <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
                            {cat.slug}
                        </code>
                    ),
                },
                {
                    key: "description",
                    label: "Description",
                    render: (cat) =>
                        cat.description || (
                            <span className="text-muted-foreground italic">
                                No description
                            </span>
                        ),
                    className: "max-w-xs truncate",
                },
                {
                    key: "sortOrder",
                    label: "Sort Order",
                    render: (cat) => (
                        <span className="text-muted-foreground">
                            {cat.sortOrder}
                        </span>
                    ),
                },
                {
                    key: "isActive",
                    label: "Status",
                    render: (cat) => (
                        <Badge
                            variant={cat.isActive ? "default" : "secondary"}
                            aria-label={
                                cat.isActive
                                    ? "Active category"
                                    : "Inactive category"
                            }
                        >
                            {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                    ),
                },
            ],
            actions: [
                {
                    key: "edit",
                    label: "Edit",
                    variant: "secondary",
                    onClick: (cat) => setEditingCategory(cat),
                },
                {
                    key: "delete",
                    label: "Delete",
                    variant: "destructive",
                    onClick: (cat) => setDeletingCategory(cat),
                },
            ],
            filters: filterDefinitions,
            defaultPageSize: 25,
            enablePagination: true,
            manualFiltering: true,
            manualPagination: true,
            emptyMessage:
                searchFilter || statusFilter !== undefined
                    ? "No categories match your filters"
                    : "No categories found. Create your first category to get started.",
            loadingMessage: "Loading categories...",
        }),
        [filterDefinitions, searchFilter, statusFilter]
    );

    // Convert SWR error to string for GenericTable
    const getErrorMessage = (): string | null => {
        if (!error) return null;
        if (typeof error === "object" && "message" in error) {
            return String(error.message);
        }
        return errorMessages.hrCategories.load;
    };
    const errorMessage = getErrorMessage();

    return (
        <div className="space-y-4">
            {/* Header with Create button */}
            <div className="flex justify-end">
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Table with stale indicator during search */}
            <div
                className={cn(
                    "transition-opacity duration-200",
                    isSearchStale && "opacity-60"
                )}
            >
                <GenericTable
                    data={categories}
                    loading={isLoading}
                    error={errorMessage}
                    config={tableConfig}
                    onRefresh={handleRefresh}
                    state={tableState}
                    totalItems={totalCategories}
                />
            </div>

            {/* Create Dialog */}
            <HrCategoryFormDialog
                mode="create"
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleDialogSuccess}
            />

            {/* Edit Dialog */}
            {editingCategory && (
                <HrCategoryFormDialog
                    mode="edit"
                    open={!!editingCategory}
                    category={editingCategory}
                    onOpenChange={(open) => !open && setEditingCategory(null)}
                    onSuccess={handleDialogSuccess}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deletingCategory}
                onOpenChange={(open) => {
                    // Prevent dismissal while delete is in progress
                    if (isDeleting) return;
                    if (!open) setDeletingCategory(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;
                            {deletingCategory?.name}&quot;? This action cannot
                            be undone.
                            <br />
                            <br />
                            <strong>Note:</strong> Categories that are in use by
                            links cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
