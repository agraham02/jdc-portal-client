"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FileService } from "@/lib/services/file";
import { FileStatus, FilesResponse, UploadedFile } from "@/lib/types/file";
import {
    DownloadIcon,
    EyeIcon,
    RefreshCcwIcon,
    Trash2Icon,
    RotateCcwIcon,
    Search,
} from "lucide-react";
import { format } from "date-fns";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

type SortDir = "asc" | "desc";

export function HrDocumentsTable() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<FilesResponse | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<SortDir>("desc");

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await FileService.getHrDocuments({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
            });
            setData(res);
        } catch (e: unknown) {
            console.error(e);
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: string }).message)
                    : "Failed to load documents";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, search, sortBy, sortOrder]);

    const onDownload = async (file: UploadedFile) => {
        try {
            // Use fresh signed URL to avoid expiry issues
            const { url } = await FileService.getSignedDownloadUrl(file._id);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.originalName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch {
            toast.error("Download failed");
        }
    };

    const onView = async (file: UploadedFile) => {
        try {
            const { url } = await FileService.getSignedViewUrl(file._id);
            window.open(url, "_blank");
        } catch {
            toast.error("Open failed");
        }
    };

    const onDelete = async (file: UploadedFile) => {
        if (!confirm(`Delete ${file.originalName}?`)) return;
        try {
            await FileService.deleteFile(file._id);
            toast.success("Deleted");
            load();
        } catch {
            toast.error("Delete failed");
        }
    };

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/png",
        "image/jpeg",
    ];
    const maxBytes = 10 * 1024 * 1024; // 10MB

    const onReplace = async (file: UploadedFile, picked: File | null) => {
        if (!picked) return;
        if (!allowedTypes.includes(picked.type)) {
            toast.error("Unsupported file type");
            return;
        }
        if (picked.size > maxBytes) {
            toast.error("File too large (max 10MB)");
            return;
        }
        try {
            await FileService.replaceFile(file._id, picked, {
                description: file.description,
            });
            toast.success("File replaced");
            load();
        } catch {
            toast.error("Replace failed");
        }
    };

    const totalPages = useMemo(() => data?.totalPages ?? 1, [data]);

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6 px-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80">
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
                            setLimit(parseInt(v, 10));
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
                <div className="flex gap-2 justify-end">
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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2">
                            <TableHead className="w-12"></TableHead>
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
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        {error && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-red-600">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && !error && data?.files?.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
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
                            !error &&
                            data?.files?.map((f) => (
                                <TableRow
                                    key={f._id}
                                    className="hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="w-12">
                                        <div className="flex items-center justify-center">
                                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                                                <EyeIcon className="h-4 w-4 text-blue-600" />
                                            </div>
                                        </div>
                                    </TableCell>
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
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {f.mimetype
                                                ?.split("/")?.[1]
                                                ?.toUpperCase() || "FILE"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {FileService.formatFileSize(f.size)}
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
                                    <TableCell>
                                        <Badge
                                            variant={
                                                f.status === FileStatus.APPROVED
                                                    ? "secondary"
                                                    : "outline"
                                            }
                                            className="capitalize"
                                        >
                                            {f.status === FileStatus.APPROVED
                                                ? "Available"
                                                : f.status}
                                        </Badge>
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
                                            <Can anyOf={[P.FILE_UPDATE_ALL]}>
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
                                            <Can anyOf={[P.FILE_DELETE_ALL]}>
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
                    {data?.total ? (
                        <>
                            Showing {(data.page - 1) * limit + 1} to{" "}
                            {Math.min(data.page * limit, data.total)} of{" "}
                            {data.total.toLocaleString()} documents
                        </>
                    ) : (
                        "No documents to show"
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                        Page {data?.page ?? page} of {totalPages}
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
        </div>
    );
}
