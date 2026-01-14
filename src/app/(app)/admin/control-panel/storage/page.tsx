"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    HardDrive,
    Trash2,
    Search,
    FileText,
    RefreshCw,
    AlertTriangle,
    ChevronRight,
    Folder,
    Home,
    ChevronLeft,
    Package,
    Image as ImageIcon,
    FileCode,
    File,
    Copy,
    Check,
    X,
    Cloud,
    Globe,
    CheckCircle2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { apiClient } from "@/lib/api";
import { apiToast } from "@/lib/utils/toast-helpers";
import { buildApiPath } from "@/lib/utils/queryParams";

interface S3Object {
    key: string;
    size: number;
    lastModified: string;
    etag: string;
}

interface S3ListResponse {
    objects: S3Object[];
    totalCount: number;
    totalSize: number;
    continuationToken?: string;
    isTruncated: boolean;
}

interface StorageStats {
    totalObjects: number;
    totalSize: number;
    bucketName: string;
    region: string;
}

// Get file icon based on extension
function getFileIcon(key: string) {
    const ext = key.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "ico"].includes(ext)) {
        return <ImageIcon className="h-4 w-4 text-purple-500" />;
    }
    if (["pdf"].includes(ext)) {
        return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (["json", "js", "ts", "tsx", "jsx", "html", "css"].includes(ext)) {
        return <FileCode className="h-4 w-4 text-blue-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
}

// Stats card component
function StatCard({
    title,
    value,
    icon: Icon,
    description,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
}) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StorageManagerDashboard() {
    const [objects, setObjects] = useState<S3Object[]>([]);
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [selectedObjects, setSelectedObjects] = useState<Set<string>>(
        new Set()
    );
    const [deleting, setDeleting] = useState(false);
    const [continuationToken, setContinuationToken] = useState<
        string | undefined
    >();
    const [currentPrefix, setCurrentPrefix] = useState<string>("");
    const [prefixHistory, setPrefixHistory] = useState<string[]>([]);
    const [orphanedObjects, setOrphanedObjects] = useState<{
        orphanedObjects: S3Object[];
        totalOrphaned: number;
        totalSize: number;
    } | null>(null);
    const [loadingOrphaned, setLoadingOrphaned] = useState(false);
    const [activeTab, setActiveTab] = useState("browse");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [objectToDelete, setObjectToDelete] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const fetchObjects = async (token?: string, prefix?: string) => {
        try {
            setLoading(true);
            const path = buildApiPath("/admin/storage/objects", {
                maxKeys: 50,
                continuationToken: token,
                prefix: prefix,
            });
            const response = await apiClient.get<S3ListResponse>(path);
            setObjects(response.objects);
            setContinuationToken(response.continuationToken);
        } catch (error) {
            console.error(error);
            apiToast.error("Failed to fetch S3 objects");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get<StorageStats>(
                "/admin/storage/stats"
            );
            setStats(response);
        } catch (error) {
            console.error(error);
            apiToast.error("Failed to fetch storage stats");
        }
    };

    const searchObjects = async () => {
        if (!searchTerm.trim()) {
            fetchObjects();
            return;
        }

        try {
            setIsSearching(true);
            const path = buildApiPath("/admin/storage/objects/search", {
                q: searchTerm,
                maxResults: 100,
            });
            const response = await apiClient.get<S3Object[]>(path);
            setObjects(response);
            setContinuationToken(undefined);
        } catch (error) {
            console.error(error);
            apiToast.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    const deleteObject = async (key: string) => {
        if (
            !confirm(
                `Are you sure you want to delete:\n\n${key}\n\nThis action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            setDeleting(true);
            await apiClient.delete(
                `/admin/storage/objects/${encodeURIComponent(key)}`
            );
            apiToast.success(`Deleted: ${key}`);
            fetchObjects();
            fetchStats();
        } catch (error) {
            console.error(error);
            apiToast.error(`Failed to delete: ${key}`);
        } finally {
            setDeleting(false);
        }
    };

    const deleteSelected = async () => {
        const keys = Array.from(selectedObjects);
        if (keys.length === 0) return;

        if (
            !confirm(
                `Are you sure you want to delete ${keys.length} object(s)?\n\nThis action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            setDeleting(true);
            const response = await apiClient.post<{
                deleted: string[];
                failed: string[];
            }>("/admin/storage/objects/delete-batch", {
                keys,
            });

            if (response.deleted.length > 0) {
                apiToast.success(
                    `Deleted ${response.deleted.length} object(s)`
                );
            }
            if (response.failed.length > 0) {
                apiToast.error(
                    `Failed to delete ${response.failed.length} object(s)`
                );
            }

            setSelectedObjects(new Set());
            fetchObjects();
            fetchStats();
        } catch (error) {
            console.error(error);
            apiToast.error("Batch delete failed");
        } finally {
            setDeleting(false);
        }
    };

    const toggleSelection = (key: string) => {
        const newSelection = new Set(selectedObjects);
        if (newSelection.has(key)) {
            newSelection.delete(key);
        } else {
            newSelection.add(key);
        }
        setSelectedObjects(newSelection);
    };

    const selectAll = () => {
        if (selectedObjects.size === objects.length) {
            setSelectedObjects(new Set());
        } else {
            setSelectedObjects(new Set(objects.map((obj) => obj.key)));
        }
    };

    const fetchOrphanedObjects = async () => {
        try {
            setLoadingOrphaned(true);
            const response = await apiClient.get<{
                orphanedObjects: S3Object[];
                totalOrphaned: number;
                totalSize: number;
            }>("/admin/storage/orphaned");
            setOrphanedObjects(response);
            apiToast.success(
                `Found ${response.totalOrphaned} orphaned object(s)`
            );
        } catch (error) {
            console.error(error);
            apiToast.error("Failed to fetch orphaned objects");
        } finally {
            setLoadingOrphaned(false);
        }
    };

    const navigateToPrefix = (prefix: string) => {
        if (prefix !== currentPrefix) {
            setPrefixHistory([...prefixHistory, currentPrefix]);
        }
        setCurrentPrefix(prefix);
        setSearchTerm("");
        fetchObjects(undefined, prefix);
    };

    const navigateBack = () => {
        if (prefixHistory.length > 0) {
            const previous = prefixHistory[prefixHistory.length - 1];
            setPrefixHistory(prefixHistory.slice(0, -1));
            setCurrentPrefix(previous);
            fetchObjects(undefined, previous);
        }
    };

    const goToRoot = () => {
        setPrefixHistory([]);
        setCurrentPrefix("");
        fetchObjects(undefined, "");
    };

    useEffect(() => {
        fetchObjects(undefined, currentPrefix);
        fetchStats();
    }, [currentPrefix]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const confirmDelete = (key: string) => {
        setObjectToDelete(key);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!objectToDelete) return;
        await deleteObject(objectToDelete);
        setShowDeleteDialog(false);
        setObjectToDelete(null);
    };

    // Extract folders from objects
    const folders = useMemo(() => {
        const folderSet = new Set<string>();
        const prefixLength = currentPrefix.length;

        objects.forEach((obj) => {
            const relativePath = obj.key.substring(prefixLength);
            const slashIndex = relativePath.indexOf("/");
            if (slashIndex > 0) {
                const folder = relativePath.substring(0, slashIndex + 1);
                folderSet.add(currentPrefix + folder);
            }
        });

        return Array.from(folderSet).sort();
    }, [objects, currentPrefix]);

    // Get files only (not folders)
    const files = useMemo(
        () =>
            objects.filter(
                (obj) => !obj.key.substring(currentPrefix.length).includes("/")
            ),
        [objects, currentPrefix]
    );

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Cloud className="h-8 w-8 text-primary" />
                            Storage Manager
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Browse, search, and manage S3 objects
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            fetchObjects(undefined, currentPrefix);
                            fetchStats();
                        }}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </Button>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Objects"
                            value={stats.totalObjects.toLocaleString()}
                            icon={Package}
                            description="Files stored in bucket"
                        />
                        <StatCard
                            title="Total Size"
                            value={formatBytes(stats.totalSize)}
                            icon={HardDrive}
                            description="Storage used"
                        />
                        <StatCard
                            title="Bucket"
                            value={stats.bucketName}
                            icon={Cloud}
                        />
                        <StatCard
                            title="Region"
                            value={stats.region}
                            icon={Globe}
                        />
                    </div>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
                        <TabsTrigger
                            value="browse"
                            className="flex items-center gap-2"
                        >
                            <Folder className="h-4 w-4" />
                            Browse
                        </TabsTrigger>
                        <TabsTrigger
                            value="search"
                            className="flex items-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </TabsTrigger>
                        <TabsTrigger
                            value="orphaned"
                            className="flex items-center gap-2"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            Orphaned
                        </TabsTrigger>
                    </TabsList>

                    {/* Browse Tab */}
                    <TabsContent value="browse" className="space-y-4">
                        {/* Breadcrumb Navigation */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Button
                                        variant={
                                            currentPrefix === ""
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        size="sm"
                                        onClick={goToRoot}
                                    >
                                        <Home className="h-4 w-4 mr-1" />
                                        Root
                                    </Button>
                                    {currentPrefix && (
                                        <>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            {prefixHistory.length > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={navigateBack}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-xs"
                                            >
                                                {currentPrefix}
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Batch Actions Bar */}
                        {selectedObjects.size > 0 && (
                            <Card className="border-primary/50 bg-primary/5">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                            <span className="font-medium">
                                                {selectedObjects.size} object
                                                {selectedObjects.size === 1
                                                    ? ""
                                                    : "s"}{" "}
                                                selected
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedObjects(
                                                        new Set()
                                                    )
                                                }
                                            >
                                                Deselect All
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={deleteSelected}
                                                disabled={deleting}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Selected
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* File Browser */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Files & Folders
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAll}
                                    >
                                        {selectedObjects.size === objects.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <span className="ml-3 text-muted-foreground">
                                            Loading...
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {/* Folders */}
                                        {folders.map((folder) => (
                                            <div
                                                key={folder}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() =>
                                                    navigateToPrefix(folder)
                                                }
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Folder className="h-5 w-5 text-blue-500" />
                                                    <span className="font-medium">
                                                        {folder.replace(
                                                            currentPrefix,
                                                            ""
                                                        )}
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        ))}

                                        {/* Files */}
                                        {files.map((obj) => (
                                            <div
                                                key={obj.key}
                                                className={`group flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                                    selectedObjects.has(obj.key)
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:bg-muted/50"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedObjects.has(
                                                            obj.key
                                                        )}
                                                        onChange={() =>
                                                            toggleSelection(
                                                                obj.key
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    {getFileIcon(obj.key)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-mono text-sm truncate">
                                                            {obj.key
                                                                .split("/")
                                                                .pop()}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatBytes(
                                                                obj.size
                                                            )}{" "}
                                                            •{" "}
                                                            {formatDate(
                                                                obj.lastModified
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        obj.key
                                                                    )
                                                                }
                                                            >
                                                                {copiedKey ===
                                                                obj.key ? (
                                                                    <Check className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Copy path
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                                                onClick={() =>
                                                                    confirmDelete(
                                                                        obj.key
                                                                    )
                                                                }
                                                                disabled={
                                                                    deleting
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Delete
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        ))}

                                        {objects.length === 0 && (
                                            <div className="text-center py-12">
                                                <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground">
                                                    {currentPrefix
                                                        ? "This folder is empty"
                                                        : "No objects found"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pagination */}
                                {continuationToken && (
                                    <div className="flex justify-center mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                fetchObjects(
                                                    continuationToken,
                                                    currentPrefix
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            Load More
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Search Tab */}
                    <TabsContent value="search" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Search Objects</CardTitle>
                                <CardDescription>
                                    Search for files by name across all folders
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by file name or path..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    searchObjects();
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button
                                        onClick={searchObjects}
                                        disabled={isSearching}
                                    >
                                        {isSearching ? (
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4 mr-2" />
                                        )}
                                        Search
                                    </Button>
                                    {searchTerm && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchTerm("");
                                                fetchObjects(
                                                    undefined,
                                                    currentPrefix
                                                );
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Search Results */}
                        {searchTerm && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Search Results</CardTitle>
                                    <CardDescription>
                                        {objects.length} result
                                        {objects.length === 1 ? "" : "s"} for
                                        &quot;{searchTerm}&quot;
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        {objects.map((obj) => (
                                            <div
                                                key={obj.key}
                                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {getFileIcon(obj.key)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-mono text-sm truncate">
                                                            {obj.key}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatBytes(
                                                                obj.size
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600"
                                                    onClick={() =>
                                                        confirmDelete(obj.key)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Orphaned Files Tab */}
                    <TabsContent value="orphaned" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    Orphaned Files Detection
                                </CardTitle>
                                <CardDescription>
                                    Find files in storage that are not
                                    referenced in the database
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={fetchOrphanedObjects}
                                    disabled={loadingOrphaned}
                                    variant="outline"
                                >
                                    {loadingOrphaned ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4 mr-2" />
                                    )}
                                    Scan for Orphaned Files
                                </Button>

                                {orphanedObjects && (
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <Badge
                                                variant={
                                                    orphanedObjects.totalOrphaned >
                                                    0
                                                        ? "destructive"
                                                        : "secondary"
                                                }
                                            >
                                                {orphanedObjects.totalOrphaned}{" "}
                                                orphaned files
                                            </Badge>
                                            <Badge variant="outline">
                                                {formatBytes(
                                                    orphanedObjects.totalSize
                                                )}{" "}
                                                total
                                            </Badge>
                                        </div>

                                        {orphanedObjects.orphanedObjects
                                            .length > 0 && (
                                            <div className="space-y-1 max-h-80 overflow-y-auto">
                                                {orphanedObjects.orphanedObjects.map(
                                                    (obj) => (
                                                        <div
                                                            key={obj.key}
                                                            className="flex items-center justify-between p-3 rounded-lg border bg-red-50/50 dark:bg-red-950/20"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                {getFileIcon(
                                                                    obj.key
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-mono text-sm truncate">
                                                                        {
                                                                            obj.key
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatBytes(
                                                                            obj.size
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-600"
                                                                onClick={() =>
                                                                    confirmDelete(
                                                                        obj.key
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {orphanedObjects.totalOrphaned ===
                                            0 && (
                                            <div className="text-center py-8">
                                                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                                                <p className="text-muted-foreground">
                                                    No orphaned files found.
                                                    Storage is clean!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Object</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this object?
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="font-mono text-sm break-all">
                                {objectToDelete}
                            </p>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirmed}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}

export default function StoragePage() {
    return (
        <ProtectedRoute anyOf={[P.ADMIN_STORAGE_READ]}>
            <StorageManagerDashboard />
        </ProtectedRoute>
    );
}
