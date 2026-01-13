"use client";

import { useEffect, useState, useDeferredValue } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { HrDocumentsService } from "@/lib/services/file";
import { HrCategory } from "@/lib/types/file";
import {
    RefreshCcwIcon,
    Trash2Icon,
    PencilIcon,
    Search,
    PlusIcon,
} from "lucide-react";
import { CreateHrCategoryDialog } from "./CreateHrCategoryDialog";
import { EditHrCategoryDialog } from "./EditHrCategoryDialog";
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

export function HrCategoriesTable() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<HrCategory[]>([]);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<HrCategory | null>(
        null
    );
    const [deletingCategory, setDeletingCategory] = useState<HrCategory | null>(
        null
    );
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await HrDocumentsService.getCategories({
                limit: 100,
                search: deferredSearch || undefined,
            });
            setCategories(res.categories);
        } catch (e: unknown) {
            console.error(e);
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: string }).message)
                    : "Failed to load categories";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deferredSearch]);

    const onDelete = async () => {
        if (!deletingCategory) return;
        setDeleting(true);
        try {
            await HrDocumentsService.deleteCategory(deletingCategory._id);
            toast.success("Category deleted successfully");
            setDeletingCategory(null);
            load();
        } catch (e: unknown) {
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: string }).message)
                    : "Failed to delete category";
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Category
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={load}
                        disabled={loading}
                    >
                        <RefreshCcwIcon className="h-4 w-4 mr-2" />
                        {loading ? "Loading..." : "Refresh"}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2">
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Sort Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <>
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                            </>
                        )}
                        {error && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-red-600">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && !error && categories.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-12"
                                >
                                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                        <p className="font-medium text-lg">
                                            No categories found
                                        </p>
                                        <p className="text-sm">
                                            {search
                                                ? `No categories match "${search}"`
                                                : "Create your first category to get started"}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            !error &&
                            categories.map((cat) => (
                                <TableRow
                                    key={cat._id}
                                    className="hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-medium">
                                        {cat.name}
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-sm bg-muted px-1 py-0.5 rounded">
                                            {cat.slug}
                                        </code>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {cat.description || (
                                            <span className="text-muted-foreground italic">
                                                No description
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{cat.sortOrder}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                cat.isActive
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {cat.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setEditingCategory(cat)
                                                }
                                                title="Edit"
                                                aria-label={`Edit ${cat.name}`}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeletingCategory(cat)
                                                }
                                                title="Delete"
                                                aria-label={`Delete ${cat.name}`}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2Icon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <CreateHrCategoryDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={load}
            />

            {/* Edit Dialog */}
            {editingCategory && (
                <EditHrCategoryDialog
                    open={!!editingCategory}
                    category={editingCategory}
                    onOpenChange={(open: boolean) =>
                        !open && setEditingCategory(null)
                    }
                    onSuccess={load}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deletingCategory}
                onOpenChange={(open) => {
                    // Prevent dismissal while delete is in progress
                    if (deleting) return;
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
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
