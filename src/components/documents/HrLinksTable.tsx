"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { HrLink, HrCategoryRef, HrCategory } from "@/lib/types/file";
import {
    ExternalLinkIcon,
    RefreshCcwIcon,
    Trash2Icon,
    PencilIcon,
    Search,
    PlusIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Can } from "@/components/auth/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { CreateHrLinkDialog } from "./CreateHrLinkDialog";
import { EditHrLinkDialog } from "./EditHrLinkDialog";

type SortDir = "asc" | "desc";

export function HrLinksTable() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [links, setLinks] = useState<HrLink[]>([]);
    const [categories, setCategories] = useState<HrCategory[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<SortDir>("desc");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<HrLink | null>(null);

    // Load categories once on mount
    useEffect(() => {
        let cancelled = false;
        const loadCategories = async () => {
            try {
                const res = await HrDocumentsService.getCategories({
                    isActive: true,
                    limit: 100,
                });
                if (!cancelled) setCategories(res.categories);
            } catch (e) {
                console.error("Failed to load categories:", e);
            }
        };
        loadCategories();
        return () => {
            cancelled = true;
        };
    }, []);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            // Determine isActive filter value
            let isActiveValue: boolean | undefined;
            if (activeFilter === "active") {
                isActiveValue = true;
            } else if (activeFilter === "inactive") {
                isActiveValue = false;
            }

            const res = await HrDocumentsService.getLinks({
                page,
                limit,
                search: search || undefined,
                category: categoryFilter === "all" ? undefined : categoryFilter,
                isActive: isActiveValue,
                sortBy,
                sortOrder,
            });
            setLinks(res.links);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (e: unknown) {
            console.error(e);
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: string }).message)
                    : "Failed to load links";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, search, categoryFilter, activeFilter, sortBy, sortOrder]);

    const onDelete = async (link: HrLink) => {
        if (!confirm(`Delete link "${link.title}"?`)) return;
        try {
            await HrDocumentsService.deleteLink(link._id);
            toast.success("Link deleted successfully");
            load();
        } catch {
            toast.error("Failed to delete link");
        }
    };

    const onToggleActive = async (link: HrLink) => {
        try {
            await HrDocumentsService.updateLink(link._id, {
                isActive: !link.isActive,
            });
            toast.success(
                link.isActive
                    ? "Link deactivated successfully"
                    : "Link activated successfully"
            );
            load();
        } catch (e: unknown) {
            const action = link.isActive ? "deactivate" : "activate";
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: string }).message)
                    : `Failed to ${action} link`;
            toast.error(msg);
        }
    };

    /** Extract category name from populated object or fallback to string */
    const getCategoryName = (category: HrCategoryRef | string): string => {
        if (typeof category === "object" && category !== null) {
            return category.name;
        }
        return String(category);
    };

    /** Generate consistent badge color based on category name hash */
    const getCategoryBadgeColor = (
        category: HrCategoryRef | string
    ): string => {
        const name = getCategoryName(category);
        const colorPalette = [
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
            "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
            "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
            "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
            "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
        ];
        // Simple hash to get consistent color per category
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            const codePoint = name.codePointAt(i);
            if (codePoint !== undefined) {
                hash = codePoint + ((hash << 5) - hash);
            }
        }
        return colorPalette[Math.abs(hash) % colorPalette.length];
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 mb-6 px-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1 sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search links..."
                                value={search}
                                onChange={(e) => {
                                    setPage(1);
                                    setSearch(e.target.value);
                                }}
                                className="pl-9"
                            />
                        </div>
                        <Select
                            value={categoryFilter}
                            onValueChange={(v) => {
                                setPage(1);
                                setCategoryFilter(v);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={activeFilter}
                            onValueChange={(v) => {
                                setPage(1);
                                setActiveFilter(v);
                            }}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">
                                    Active Only
                                </SelectItem>
                                <SelectItem value="inactive">
                                    Inactive Only
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={`${limit}`}
                            onValueChange={(v) => {
                                setPage(1);
                                setLimit(Number.parseInt(v, 10));
                            }}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Page size" />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map((n) => (
                                    <SelectItem key={n} value={`${n}`}>
                                        {n} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Can anyOf={[P.HR_DOCUMENT_CREATE]}>
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Link
                            </Button>
                        </Can>
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
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2">
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => {
                                    setSortBy("title");
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    );
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    Title
                                    {sortBy === "title" && (
                                        <span className="text-xs">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => {
                                    setSortBy("createdAt");
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    );
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    Created
                                    {sortBy === "createdAt" && (
                                        <span className="text-xs">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skeleton-${String(i)}`}>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        {error && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-red-600">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && !error && links.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-12"
                                >
                                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                        <ExternalLinkIcon className="h-12 w-12" />
                                        <div>
                                            <p className="font-medium text-lg">
                                                No links found
                                            </p>
                                            <p className="text-sm">
                                                {search
                                                    ? `No links match "${search}"`
                                                    : "No links have been created yet"}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            !error &&
                            links.map((link) => (
                                <TableRow
                                    key={link._id}
                                    className="hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-xs">
                                                {link.title}
                                            </span>
                                            {link.description && (
                                                <span className="text-xs text-muted-foreground truncate max-w-xs">
                                                    {link.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={getCategoryBadgeColor(
                                                link.category
                                            )}
                                        >
                                            {getCategoryName(link.category)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-xs text-sm"
                                        >
                                            <span className="truncate">
                                                {link.url}
                                            </span>
                                            <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge
                                                variant={
                                                    link.isActive
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {link.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </Badge>
                                            {link.isPublic ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                                >
                                                    Public
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                                >
                                                    Private
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div className="flex flex-col">
                                            <span>
                                                {format(
                                                    new Date(link.createdAt),
                                                    "MMM d, yyyy"
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                by {link.createdBy.firstName}{" "}
                                                {link.createdBy.lastName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    window.open(
                                                        link.url,
                                                        "_blank"
                                                    )
                                                }
                                                title="Open link"
                                                aria-label={`Open ${link.title} in new tab`}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ExternalLinkIcon className="h-4 w-4" />
                                            </Button>
                                            <Can anyOf={[P.HR_DOCUMENT_UPDATE]}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setEditingLink(link)
                                                    }
                                                    title="Edit link"
                                                    aria-label={`Edit ${link.title}`}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        onToggleActive(link)
                                                    }
                                                    title={
                                                        link.isActive
                                                            ? "Deactivate link"
                                                            : "Activate link"
                                                    }
                                                    aria-label={
                                                        link.isActive
                                                            ? `Deactivate ${link.title}`
                                                            : `Activate ${link.title}`
                                                    }
                                                    className="h-8 px-2"
                                                >
                                                    {link.isActive
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </Button>
                                            </Can>
                                            <Can anyOf={[P.HR_DOCUMENT_DELETE]}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        onDelete(link)
                                                    }
                                                    title="Delete link"
                                                    aria-label={`Delete ${link.title}`}
                                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            </Can>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                <div className="text-sm text-muted-foreground">
                    {total > 0 ? (
                        <>
                            Showing {(page - 1) * limit + 1} to{" "}
                            {Math.min(page * limit, total)} of{" "}
                            {total.toLocaleString()} links
                        </>
                    ) : (
                        "No links to show"
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || loading}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page >= totalPages || loading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            <CreateHrLinkDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={load}
            />

            {editingLink && (
                <EditHrLinkDialog
                    open={!!editingLink}
                    link={editingLink}
                    onOpenChange={(open: boolean) =>
                        !open && setEditingLink(null)
                    }
                    onSuccess={load}
                />
            )}
        </div>
    );
}
