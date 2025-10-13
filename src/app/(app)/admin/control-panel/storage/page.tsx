"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

    const extractFolders = (objects: S3Object[]): string[] => {
        const folders = new Set<string>();
        const prefixLength = currentPrefix.length;

        objects.forEach((obj) => {
            const relativePath = obj.key.substring(prefixLength);
            const slashIndex = relativePath.indexOf("/");
            if (slashIndex > 0) {
                const folder = relativePath.substring(0, slashIndex + 1);
                folders.add(currentPrefix + folder);
            }
        });

        return Array.from(folders).sort();
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <HardDrive className="h-8 w-8" />
                        Storage Manager
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Browse, search, and manage S3 objects
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        fetchObjects();
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

            {/* Breadcrumb Navigation */}
            {currentPrefix && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={goToRoot}
                            >
                                <Home className="h-4 w-4 mr-1" />
                                Root
                            </Button>
                            {prefixHistory.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={navigateBack}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Button>
                            )}
                            <span className="text-muted-foreground">
                                Current:{" "}
                                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {currentPrefix || "/"}
                                </code>
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Storage Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Objects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalObjects.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Size
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatBytes(stats.totalSize)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Bucket
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold truncate">
                                {stats.bucketName}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Region
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.region}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search Bar & Orphaned Files */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search objects by key..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    searchObjects();
                                }
                            }}
                        />
                        <Button onClick={searchObjects} disabled={isSearching}>
                            <Search
                                className={`h-4 w-4 mr-2 ${
                                    isSearching ? "animate-spin" : ""
                                }`}
                            />
                            Search
                        </Button>
                        {searchTerm && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("");
                                    fetchObjects(undefined, currentPrefix);
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                            <Package className="h-4 w-4 inline mr-1" />
                            Find files not referenced in database
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchOrphanedObjects}
                            disabled={loadingOrphaned}
                        >
                            {loadingOrphaned ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Package className="h-4 w-4 mr-2" />
                            )}
                            Find Orphaned Files
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orphaned Files Results */}
            {orphanedObjects && orphanedObjects.totalOrphaned > 0 && (
                <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                            <AlertTriangle className="h-5 w-5" />
                            Orphaned Files Detected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm">
                                Found{" "}
                                <strong>{orphanedObjects.totalOrphaned}</strong>{" "}
                                file(s) not referenced in database (Total size:{" "}
                                <strong>
                                    {formatBytes(orphanedObjects.totalSize)}
                                </strong>
                                )
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Showing first{" "}
                                {orphanedObjects.orphanedObjects.length} results
                            </p>
                            <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                                {orphanedObjects.orphanedObjects.map((obj) => (
                                    <div
                                        key={obj.key}
                                        className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded flex items-center justify-between"
                                    >
                                        <span className="truncate flex-1">
                                            {obj.key}
                                        </span>
                                        <span className="text-muted-foreground ml-2">
                                            {formatBytes(obj.size)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Batch Actions */}
            {selectedObjects.size > 0 && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <span className="font-semibold">
                                    {selectedObjects.size} object(s) selected
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setSelectedObjects(new Set())
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

            {/* Objects Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            S3 Objects
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={selectAll}>
                            {selectedObjects.size === objects.length
                                ? "Deselect All"
                                : "Select All"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading objects...</span>
                        </div>
                    ) : objects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No objects found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Display folders first */}
                            {extractFolders(objects).map((folder) => (
                                <div
                                    key={folder}
                                    className="flex items-center justify-between p-3 rounded border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                    onClick={() => navigateToPrefix(folder)}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Folder className="h-5 w-5 text-blue-600" />
                                        <div className="font-semibold">
                                            {folder.replace(currentPrefix, "")}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            ))}

                            {/* Display files */}
                            {objects
                                .filter(
                                    (obj) =>
                                        !obj.key
                                            .substring(currentPrefix.length)
                                            .includes("/")
                                )
                                .map((obj) => (
                                    <div
                                        key={obj.key}
                                        className={`flex items-center justify-between p-3 rounded border ${
                                            selectedObjects.has(obj.key)
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedObjects.has(
                                                    obj.key
                                                )}
                                                onChange={() =>
                                                    toggleSelection(obj.key)
                                                }
                                                className="h-4 w-4"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-sm truncate">
                                                    {obj.key}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatBytes(obj.size)} •{" "}
                                                    {formatDate(
                                                        obj.lastModified
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                deleteObject(obj.key)
                                            }
                                            disabled={deleting}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {continuationToken && (
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                onClick={() => fetchObjects(continuationToken)}
                                disabled={loading}
                            >
                                Load More
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function StoragePage() {
    return (
        <ProtectedRoute anyOf={[P.ADMIN_STORAGE_READ]}>
            <StorageManagerDashboard />
        </ProtectedRoute>
    );
}
