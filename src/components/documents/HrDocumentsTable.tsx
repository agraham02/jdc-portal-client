"use client";

import { useState, useDeferredValue, useCallback } from "react";
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
import { HrDocumentsService } from "@/lib/services/file";
import { HRDocument, HRDocumentListResponse } from "@/lib/types/file";
import {
    DownloadIcon,
    EyeIcon,
    RefreshCcwIcon,
    Trash2Icon,
    RotateCcwIcon,
    Search,
    Upload,
} from "lucide-react";
import { format } from "date-fns";
import { Can } from "@/components/auth/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { formatBytes } from "@/lib/utils/formatters";
import { downloadDocument } from "@/lib/utils/document-actions";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import Link from "next/link";
import { usePaginatedApi } from "@/lib/hooks/useApi";
import { apiToast } from "@/lib/utils/toast-helpers";
import { errorMessages, successMessages } from "@/lib/utils/error-messages";
import { cn } from "@/lib/utils";

type SortDir = "asc" | "desc";

export function HrDocumentsTable() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<SortDir>("desc");
    const [previewDocument, setPreviewDocument] = useState<HRDocument | null>(
        null
    );

    // Defer search to prevent UI jank
    const deferredSearch = useDeferredValue(search);
    const isSearchStale = search !== deferredSearch;

    // Build query params for SWR
    const queryParams: Record<string, string | number | boolean> = {
        page,
        limit,
        sortBy,
        sortOrder,
    };
    if (deferredSearch) {
        queryParams.search = deferredSearch;
    }

    // SWR data fetching with automatic caching and revalidation
    const {
        data,
        error,
        isLoading: loading,
        mutate,
    } = usePaginatedApi<HRDocumentListResponse>(
        "/hr-documents/files",
        queryParams
    );

    const documents = data?.files ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    // Refresh handler
    const handleRefresh = useCallback(() => {
        mutate();
    }, [mutate]);

    const onDownload = async (file: HRDocument) => {
        await downloadDocument(file._id, file.originalName);
    };

    const onView = (file: HRDocument) => {
        setPreviewDocument(file);
    };

    const onDelete = async (file: HRDocument) => {
        if (!confirm(`Delete ${file.originalName}?`)) return;
        try {
            await HrDocumentsService.deleteFile(file._id);
            apiToast.success(successMessages.hrDocuments.deleted);
            mutate();
        } catch (e) {
            apiToast.error(errorMessages.hrDocuments.delete, e);
        }
    };

    const allowedTypes = new Set([
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/png",
        "image/jpeg",
    ]);
    const maxBytes = 100 * 1024 * 1024; // 100MB

    const onReplace = async (file: HRDocument, picked: File | null) => {
        if (!picked) return;
        if (!allowedTypes.has(picked.type)) {
            apiToast.error("Unsupported file type");
            return;
        }
        if (picked.size > maxBytes) {
            apiToast.error("File too large (max 100MB)");
            return;
        }
        try {
            await HrDocumentsService.replaceFile(file._id, picked, {
                description: file.description,
                tags: file.tags,
            });
            apiToast.success(successMessages.hrDocuments.replaced);
            mutate();
        } catch (e) {
            apiToast.error(errorMessages.hrDocuments.replace, e);
        }
    };

    // Convert error for display
    const getErrorMessage = (): string | null => {
        if (!error) return null;
        if (typeof error === "object" && "message" in error) {
            return String(error.message);
        }
        return errorMessages.hrDocuments.load;
    };
    const errorMessage = getErrorMessage();

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 mb-6 px-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1 sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search documents..."
                                value={search}
                                onChange={(e) => {
                                    setPage(1);
                                    setSearch(e.target.value);
                                }}
                                className="pl-9"
                            />
                        </div>
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
                            <Button asChild>
                                <Link
                                    href="/hr-resources/upload"
                                    className="flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload Document
                                </Link>
                            </Button>
                        </Can>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCcwIcon
                                className={cn(
                                    "h-4 w-4 mr-2",
                                    loading && "animate-spin"
                                )}
                            />
                            {loading ? "Loading..." : "Refresh"}
                        </Button>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    "rounded-md border transition-opacity duration-150",
                    isSearchStale && "opacity-70"
                )}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2">
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => {
                                    setSortBy("originalName");
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    );
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    Document Name
                                    {sortBy === "originalName" && (
                                        <span className="text-xs">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
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
                                    Upload Date
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
                        {errorMessage && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-red-600">
                                    {errorMessage}
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            !errorMessage &&
                            documents.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-12"
                                    >
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <EyeIcon className="h-12 w-12" />
                                            <div>
                                                <p className="font-medium text-lg">
                                                    No documents found
                                                </p>
                                                <p className="text-sm">
                                                    {search
                                                        ? `No documents match "${search}"`
                                                        : "No documents have been uploaded yet"}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        {!loading &&
                            !errorMessage &&
                            documents.map((f: HRDocument) => (
                                <TableRow
                                    key={f._id}
                                    className="hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-xs">
                                                {f.originalName}
                                            </span>
                                            {f.description && (
                                                <span className="text-xs text-muted-foreground truncate max-w-xs">
                                                    {f.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {f.hrCategory ? (
                                            <Badge
                                                variant="outline"
                                                className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                                            >
                                                {typeof f.hrCategory ===
                                                "object"
                                                    ? f.hrCategory.name
                                                    : f.hrCategory}
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="text-xs text-muted-foreground"
                                            >
                                                Uncategorized
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {f.mimetype
                                                    ?.split("/")?.[1]
                                                    ?.toUpperCase() || "FILE"}
                                            </Badge>
                                            {f.isPublic ? (
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
                                        {formatBytes(f.size)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div className="flex flex-col">
                                            <span>
                                                {format(
                                                    new Date(f.createdAt),
                                                    "MMM d, yyyy"
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(
                                                    new Date(f.createdAt),
                                                    "h:mm a"
                                                )}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onView(f)}
                                                title="View document"
                                                className="h-8 w-8 p-0"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onDownload(f)}
                                                title="Download document"
                                                className="h-8 w-8 p-0"
                                            >
                                                <DownloadIcon className="h-4 w-4" />
                                            </Button>
                                            <Can anyOf={[P.HR_DOCUMENT_UPDATE]}>
                                                <label className="inline-flex">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) =>
                                                            onReplace(
                                                                f,
                                                                e.target
                                                                    .files?.[0] ??
                                                                    null
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        asChild
                                                        title="Replace document"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span>
                                                            <RotateCcwIcon className="h-4 w-4" />
                                                        </span>
                                                    </Button>
                                                </label>
                                            </Can>
                                            <Can anyOf={[P.HR_DOCUMENT_DELETE]}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onDelete(f)}
                                                    title="Delete document"
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
                            {total.toLocaleString()} documents
                        </>
                    ) : (
                        "No documents to show"
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

            {/* Document Preview Modal */}
            {previewDocument && (
                <DocumentPreviewModal
                    open={!!previewDocument}
                    onOpenChange={(open) => !open && setPreviewDocument(null)}
                    documentId={previewDocument._id}
                    filename={previewDocument.originalName}
                    mimeType={previewDocument.mimetype}
                    fileSize={previewDocument.size}
                    description={previewDocument.description}
                />
            )}
        </div>
    );
}
