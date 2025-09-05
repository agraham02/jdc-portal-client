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
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                    <Input
                        placeholder="Search documents..."
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                    />
                    <Select
                        value={`${limit}`}
                        onValueChange={(v) => {
                            setPage(1);
                            setLimit(parseInt(v, 10));
                        }}
                    >
                        <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 25, 50, 100].map((n) => (
                                <SelectItem key={n} value={`${n}`}>
                                    {n} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={load}>
                        <RefreshCcwIcon className="h-4 w-4 mr-1" /> Refresh
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-6"></TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => {
                                    setSortBy("originalName");
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    );
                                }}
                            >
                                Name
                            </TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => {
                                    setSortBy("createdAt");
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    );
                                }}
                            >
                                Uploaded
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
                                    className="text-muted-foreground"
                                >
                                    No documents found
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            !error &&
                            data?.files?.map((f) => (
                                <TableRow key={f._id}>
                                    <TableCell></TableCell>
                                    <TableCell className="font-medium">
                                        {f.originalName}
                                    </TableCell>
                                    <TableCell>
                                        {f.mimetype
                                            ?.split("/")?.[1]
                                            ?.toUpperCase() || "FILE"}
                                    </TableCell>
                                    <TableCell>
                                        {FileService.formatFileSize(f.size)}
                                    </TableCell>
                                    <TableCell>
                                        {format(
                                            new Date(f.createdAt),
                                            "MMM d, yyyy p"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {f.status === FileStatus.APPROVED
                                                ? "Approved"
                                                : f.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onView(f)}
                                            title="View"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDownload(f)}
                                            title="Download"
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
                                                    title="Replace"
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
                                                title="Delete"
                                            >
                                                <Trash2Icon className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </Can>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Page {data?.page ?? page} of {totalPages};{" "}
                    {data?.total ?? 0} items
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
