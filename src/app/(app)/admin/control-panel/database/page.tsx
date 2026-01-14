"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { apiClient } from "@/lib/api";
import { apiToast } from "@/lib/utils/toast-helpers";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertTriangle,
    Database,
    Trash2,
    RotateCcw,
    Eye,
    RefreshCw,
    HardDrive,
    FileStack,
    Package,
    Search,
    ArrowUpDown,
    BarChart3,
    Shield,
    Clock,
    Copy,
    Check,
    Filter,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CollectionStats {
    name: string;
    count: number;
    size: number;
    avgObjSize: number;
    indexes: number;
}

interface DatabaseStats {
    collections: CollectionStats[];
    totalCollections: number;
    totalDocuments: number;
    totalSize: number;
    totalIndexes: number;
    databaseName: string;
}

interface CollectionDetails {
    name: string;
    count: number;
    size: number;
    avgObjSize: number;
    storageSize: number;
    indexes: { key: Record<string, unknown>; name?: string }[];
    sampleDocuments: unknown[];
}

type SortField = "name" | "count" | "size" | "indexes";
type SortDirection = "asc" | "desc";

// Stats overview card component
function StatCard({
    title,
    value,
    icon: Icon,
    color,
    subtext,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    subtext?: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
        green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
        orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {subtext && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {subtext}
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Collection row component for better organization
function CollectionRow({
    collection,
    formatBytes,
    onView,
    onClear,
    maxCount,
    maxSize,
}: {
    collection: CollectionStats;
    formatBytes: (bytes: number) => string;
    onView: () => void;
    onClear: () => void;
    maxCount: number;
    maxSize: number;
}) {
    const [copied, setCopied] = useState(false);

    const copyName = () => {
        navigator.clipboard.writeText(collection.name);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const countPercent = maxCount > 0 ? (collection.count / maxCount) * 100 : 0;
    const sizePercent = maxSize > 0 ? (collection.size / maxSize) * 100 : 0;

    return (
        <div className="group p-4 border rounded-lg hover:bg-muted/50 transition-all">
            <div className="flex items-start gap-4">
                {/* Collection Name & Actions */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold truncate">
                            {collection.name}
                        </h3>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={copyName}
                                    >
                                        {copied ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy name</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-16">
                                Docs
                            </span>
                            <Progress
                                value={countPercent}
                                className="h-1.5 flex-1"
                            />
                            <span className="text-xs font-medium w-20 text-right">
                                {collection.count.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-16">
                                Size
                            </span>
                            <Progress
                                value={sizePercent}
                                className="h-1.5 flex-1"
                            />
                            <span className="text-xs font-medium w-20 text-right">
                                {formatBytes(collection.size)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                            {collection.indexes} indexes
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            ~{formatBytes(collection.avgObjSize)}/doc
                        </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={onView}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        <Button variant="outline" size="sm" onClick={onClear}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DatabaseSandboxPage() {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedCollection, setSelectedCollection] =
        useState<CollectionDetails | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showDropDialog, setShowDropDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showClearAllDialog, setShowClearAllDialog] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [operationInProgress, setOperationInProgress] = useState(false);

    // New state for search and sorting
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        setLoading(true);
        try {
            const response = await apiClient.get<DatabaseStats>(
                "/admin/database/stats"
            );
            setStats(response);
        } catch (error) {
            console.error(error);
            apiToast.error("Failed to fetch database statistics");
        } finally {
            setLoading(false);
        }
    }

    async function fetchCollectionDetails(collectionName: string) {
        setLoading(true);
        try {
            const response = await apiClient.get<CollectionDetails>(
                `/admin/database/collections/${collectionName}`
            );
            setSelectedCollection(response);
            setShowDetailsDialog(true);
        } catch (error) {
            console.error(error);
            apiToast.error("Failed to fetch collection details");
        } finally {
            setLoading(false);
        }
    }

    function getResponseStatus(e: unknown): number | undefined {
        if (typeof e === "object" && e !== null) {
            const maybe = e as { response?: { status?: number } };
            return maybe.response?.status;
        }
        return undefined;
    }

    async function clearCollection(collectionName: string) {
        setOperationInProgress(true);
        try {
            const response = await apiClient.delete<{ deletedCount: number }>(
                `/admin/database/collections/${collectionName}/clear`
            );
            apiToast.success(
                `Cleared ${response.deletedCount} documents from ${collectionName}`
            );
            setShowClearDialog(false);
            setConfirmText("");
            await fetchStats();
        } catch (error: unknown) {
            const status = getResponseStatus(error);
            if (status === 403) {
                apiToast.error("Database operations not allowed in production");
            } else {
                apiToast.error("Failed to clear collection");
            }
        } finally {
            setOperationInProgress(false);
        }
    }

    async function dropCollection(collectionName: string) {
        setOperationInProgress(true);
        try {
            await apiClient.delete(
                `/admin/database/collections/${collectionName}`
            );
            apiToast.success(
                `Collection ${collectionName} dropped successfully`
            );
            setShowDropDialog(false);
            setConfirmText("");
            setSelectedCollection(null);
            await fetchStats();
        } catch (error: unknown) {
            const status = getResponseStatus(error);
            if (status === 403) {
                apiToast.error("Database operations not allowed in production");
            } else {
                apiToast.error("Failed to drop collection");
            }
        } finally {
            setOperationInProgress(false);
        }
    }

    async function clearAllCollections() {
        setOperationInProgress(true);
        try {
            const response = await apiClient.post<{
                clearedCollections: string[];
                totalDeleted: number;
            }>("/admin/database/clear-all");
            apiToast.success(
                `Cleared ${response.totalDeleted} documents from ${response.clearedCollections.length} collections`
            );
            setShowClearAllDialog(false);
            setConfirmText("");
            await fetchStats();
        } catch (error: unknown) {
            const status = getResponseStatus(error);
            if (status === 403) {
                apiToast.error("Database operations not allowed in production");
            } else {
                apiToast.error("Failed to clear all collections");
            }
        } finally {
            setOperationInProgress(false);
        }
    }

    async function resetDatabase() {
        setOperationInProgress(true);
        try {
            const response = await apiClient.post<{
                message: string;
                clearedCollections: string[];
                totalDeleted: number;
            }>("/admin/database/reset");
            apiToast.success(
                `Database reset: ${response.totalDeleted} documents deleted`
            );
            setShowResetDialog(false);
            setConfirmText("");
            await fetchStats();
        } catch (error: unknown) {
            const status = getResponseStatus(error);
            if (status === 403) {
                apiToast.error("Database operations not allowed in production");
            } else {
                apiToast.error("Failed to reset database");
            }
        } finally {
            setOperationInProgress(false);
        }
    }

    function formatBytes(bytes: number): string {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    // Filtered and sorted collections
    const filteredCollections = useMemo(() => {
        if (!stats?.collections) return [];

        const filtered = stats.collections.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return [...filtered].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "name":
                    comparison = a.name.localeCompare(b.name);
                    break;
                case "count":
                    comparison = a.count - b.count;
                    break;
                case "size":
                    comparison = a.size - b.size;
                    break;
                case "indexes":
                    comparison = a.indexes - b.indexes;
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [stats?.collections, searchQuery, sortField, sortDirection]);

    const maxCount = useMemo(() => {
        if (!stats?.collections) return 0;
        return Math.max(...stats.collections.map((c) => c.count));
    }, [stats?.collections]);

    const maxSize = useMemo(() => {
        if (!stats?.collections) return 0;
        return Math.max(...stats.collections.map((c) => c.size));
    }, [stats?.collections]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    return (
        <ProtectedRoute anyOf={[P.ADMIN_DATABASE_READ]}>
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Warning Banner */}
                    <Card className="border-orange-500/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                        <CardContent className="flex items-start gap-3 p-4">
                            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">
                                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                                    Staging & Development Only
                                </h3>
                                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                    Database manipulation operations are only
                                    available in staging and development
                                    environments. All operations are blocked in
                                    production for safety.
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-orange-500 text-orange-700 dark:text-orange-300"
                            >
                                <Shield className="h-3 w-3 mr-1" />
                                Protected
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Database className="h-8 w-8 text-primary" />
                                Database Sandbox
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and inspect your MongoDB database
                            </p>
                        </div>
                        <Button
                            onClick={fetchStats}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw
                                className={`h-4 w-4 mr-2 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </Button>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                            <TabsTrigger
                                value="overview"
                                className="flex items-center gap-2"
                            >
                                <BarChart3 className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="collections"
                                className="flex items-center gap-2"
                            >
                                <FileStack className="h-4 w-4" />
                                Collections
                            </TabsTrigger>
                            <TabsTrigger
                                value="danger"
                                className="flex items-center gap-2"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Danger Zone
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {stats && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard
                                            title="Database"
                                            value={stats.databaseName}
                                            icon={Database}
                                            color="blue"
                                            subtext="MongoDB instance"
                                        />
                                        <StatCard
                                            title="Collections"
                                            value={stats.totalCollections}
                                            icon={FileStack}
                                            color="green"
                                            subtext={`${stats.totalIndexes} total indexes`}
                                        />
                                        <StatCard
                                            title="Total Documents"
                                            value={stats.totalDocuments.toLocaleString()}
                                            icon={Package}
                                            color="purple"
                                        />
                                        <StatCard
                                            title="Total Size"
                                            value={formatBytes(stats.totalSize)}
                                            icon={HardDrive}
                                            color="orange"
                                        />
                                    </div>

                                    {/* Quick Stats Cards */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">
                                                    Largest Collections
                                                </CardTitle>
                                                <CardDescription>
                                                    By document count
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {[...stats.collections]
                                                        .sort(
                                                            (a, b) =>
                                                                b.count -
                                                                a.count
                                                        )
                                                        .slice(0, 5)
                                                        .map((col) => (
                                                            <div
                                                                key={col.name}
                                                                className="flex items-center justify-between"
                                                            >
                                                                <span className="font-medium truncate flex-1">
                                                                    {col.name}
                                                                </span>
                                                                <Badge variant="secondary">
                                                                    {col.count.toLocaleString()}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">
                                                    Storage Distribution
                                                </CardTitle>
                                                <CardDescription>
                                                    By storage size
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {[...stats.collections]
                                                        .sort(
                                                            (a, b) =>
                                                                b.size - a.size
                                                        )
                                                        .slice(0, 5)
                                                        .map((col) => (
                                                            <div
                                                                key={col.name}
                                                                className="space-y-1"
                                                            >
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="truncate flex-1">
                                                                        {
                                                                            col.name
                                                                        }
                                                                    </span>
                                                                    <span className="text-muted-foreground">
                                                                        {formatBytes(
                                                                            col.size
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    value={
                                                                        (col.size /
                                                                            stats.totalSize) *
                                                                        100
                                                                    }
                                                                    className="h-1"
                                                                />
                                                            </div>
                                                        ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            )}

                            {!stats && !loading && (
                                <Card className="p-12 text-center">
                                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No database statistics available
                                    </p>
                                    <Button
                                        onClick={fetchStats}
                                        className="mt-4"
                                    >
                                        Load Statistics
                                    </Button>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Collections Tab */}
                        <TabsContent value="collections" className="space-y-4">
                            {/* Search and Filter Bar */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search collections..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-10"
                                            />
                                            {searchQuery && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                                    onClick={() =>
                                                        setSearchQuery("")
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Select
                                                value={sortField}
                                                onValueChange={(v) =>
                                                    setSortField(v as SortField)
                                                }
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="name">
                                                        Name
                                                    </SelectItem>
                                                    <SelectItem value="count">
                                                        Documents
                                                    </SelectItem>
                                                    <SelectItem value="size">
                                                        Size
                                                    </SelectItem>
                                                    <SelectItem value="indexes">
                                                        Indexes
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    toggleSort(sortField)
                                                }
                                            >
                                                <ArrowUpDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {searchQuery && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Found {filteredCollections.length}{" "}
                                            collection
                                            {filteredCollections.length === 1
                                                ? ""
                                                : "s"}{" "}
                                            matching &quot;{searchQuery}&quot;
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Collections List */}
                            <div className="space-y-2">
                                {filteredCollections.map((collection) => (
                                    <CollectionRow
                                        key={collection.name}
                                        collection={collection}
                                        formatBytes={formatBytes}
                                        onView={() =>
                                            fetchCollectionDetails(
                                                collection.name
                                            )
                                        }
                                        onClear={() => {
                                            const fromStats = (
                                                cs: CollectionStats
                                            ): CollectionDetails => ({
                                                name: cs.name,
                                                count: cs.count,
                                                size: cs.size,
                                                avgObjSize: cs.avgObjSize,
                                                storageSize: 0,
                                                indexes: [],
                                                sampleDocuments: [],
                                            });
                                            setSelectedCollection(
                                                fromStats(collection)
                                            );
                                            setShowClearDialog(true);
                                        }}
                                        maxCount={maxCount}
                                        maxSize={maxSize}
                                    />
                                ))}
                            </div>

                            {filteredCollections.length === 0 && !loading && (
                                <Card className="p-12 text-center">
                                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        {searchQuery
                                            ? `No collections match "${searchQuery}"`
                                            : "No collections found"}
                                    </p>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Danger Zone Tab */}
                        <TabsContent value="danger" className="space-y-4">
                            <Card className="border-red-500/50">
                                <CardHeader>
                                    <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Destructive Operations
                                    </CardTitle>
                                    <CardDescription>
                                        These actions are irreversible. Use with
                                        extreme caution.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                                        <div className="flex-1">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Clear All Collections
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Delete all documents from all
                                                collections (keeps structure and
                                                indexes)
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setShowClearAllDialog(true)
                                            }
                                        >
                                            Clear All
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                                        <div className="flex-1">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <RotateCcw className="h-4 w-4" />
                                                Reset Database
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Reset database to clean state
                                                (clears all data)
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setShowResetDialog(true)
                                            }
                                        >
                                            Reset Database
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Operation Safety
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-muted-foreground">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Production Protection
                                            </p>
                                            <p>
                                                All destructive operations are
                                                automatically blocked in
                                                production environments.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Confirmation Required
                                            </p>
                                            <p>
                                                All operations require manual
                                                confirmation by typing a
                                                specific keyword.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Collection Details Dialog */}
                    <Dialog
                        open={showDetailsDialog}
                        onOpenChange={setShowDetailsDialog}
                    >
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    Collection: {selectedCollection?.name}
                                </DialogTitle>
                            </DialogHeader>
                            {selectedCollection && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Documents
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {selectedCollection.count.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Size
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {formatBytes(
                                                    selectedCollection.size
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Storage Size
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {formatBytes(
                                                    selectedCollection.storageSize
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Avg Doc Size
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {formatBytes(
                                                    selectedCollection.avgObjSize
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">
                                            Indexes
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedCollection.indexes.map(
                                                (index, i) => (
                                                    <div
                                                        key={i}
                                                        className="p-2 bg-muted rounded text-sm"
                                                    >
                                                        <code>
                                                            {JSON.stringify(
                                                                index.key
                                                            )}
                                                        </code>
                                                        {index.name && (
                                                            <span className="ml-2 text-muted-foreground">
                                                                ({index.name})
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">
                                            Sample Documents
                                        </h3>
                                        <div className="space-y-2 max-h-[300px] overflow-auto">
                                            {selectedCollection.sampleDocuments.map(
                                                (doc, i) => (
                                                    <pre
                                                        key={i}
                                                        className="p-3 bg-muted rounded text-xs overflow-auto"
                                                    >
                                                        {JSON.stringify(
                                                            doc,
                                                            null,
                                                            2
                                                        )}
                                                    </pre>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDetailsDialog(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setShowDetailsDialog(false);
                                        setShowDropDialog(true);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Drop Collection
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Clear Collection Dialog */}
                    <Dialog
                        open={showClearDialog}
                        onOpenChange={setShowClearDialog}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Clear Collection</DialogTitle>
                                <DialogDescription>
                                    This will delete all documents from{" "}
                                    <strong>{selectedCollection?.name}</strong>{" "}
                                    but keep the collection structure and
                                    indexes.
                                </DialogDescription>
                            </DialogHeader>
                            <div>
                                <p className="text-sm mb-2">
                                    Type <strong>CLEAR</strong> to confirm:
                                </p>
                                <Input
                                    value={confirmText}
                                    onChange={(e) =>
                                        setConfirmText(e.target.value)
                                    }
                                    placeholder="CLEAR"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowClearDialog(false);
                                        setConfirmText("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={
                                        confirmText !== "CLEAR" ||
                                        operationInProgress
                                    }
                                    onClick={() =>
                                        selectedCollection &&
                                        clearCollection(selectedCollection.name)
                                    }
                                >
                                    {operationInProgress
                                        ? "Clearing..."
                                        : "Clear Collection"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Drop Collection Dialog */}
                    <Dialog
                        open={showDropDialog}
                        onOpenChange={setShowDropDialog}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Drop Collection</DialogTitle>
                                <DialogDescription>
                                    This will permanently delete the entire{" "}
                                    <strong>{selectedCollection?.name}</strong>{" "}
                                    collection, including all documents,
                                    indexes, and structure. This action cannot
                                    be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div>
                                <p className="text-sm mb-2">
                                    Type <strong>DROP</strong> to confirm:
                                </p>
                                <Input
                                    value={confirmText}
                                    onChange={(e) =>
                                        setConfirmText(e.target.value)
                                    }
                                    placeholder="DROP"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDropDialog(false);
                                        setConfirmText("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={
                                        confirmText !== "DROP" ||
                                        operationInProgress
                                    }
                                    onClick={() =>
                                        selectedCollection &&
                                        dropCollection(selectedCollection.name)
                                    }
                                >
                                    {operationInProgress
                                        ? "Dropping..."
                                        : "Drop Collection"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Clear All Dialog */}
                    <Dialog
                        open={showClearAllDialog}
                        onOpenChange={setShowClearAllDialog}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Clear All Collections</DialogTitle>
                                <DialogDescription>
                                    This will delete all documents from ALL
                                    collections in the database, but keep the
                                    collection structures and indexes.
                                </DialogDescription>
                            </DialogHeader>
                            <div>
                                <p className="text-sm mb-2">
                                    Type <strong>CLEAR ALL</strong> to confirm:
                                </p>
                                <Input
                                    value={confirmText}
                                    onChange={(e) =>
                                        setConfirmText(e.target.value)
                                    }
                                    placeholder="CLEAR ALL"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowClearAllDialog(false);
                                        setConfirmText("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={
                                        confirmText !== "CLEAR ALL" ||
                                        operationInProgress
                                    }
                                    onClick={clearAllCollections}
                                >
                                    {operationInProgress
                                        ? "Clearing..."
                                        : "Clear All Collections"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Reset Database Dialog */}
                    <Dialog
                        open={showResetDialog}
                        onOpenChange={setShowResetDialog}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reset Database</DialogTitle>
                                <DialogDescription>
                                    This will reset the database to a clean
                                    state by deleting all documents from all
                                    collections. Collection structures and
                                    indexes will be preserved.
                                </DialogDescription>
                            </DialogHeader>
                            <div>
                                <p className="text-sm mb-2">
                                    Type <strong>RESET</strong> to confirm:
                                </p>
                                <Input
                                    value={confirmText}
                                    onChange={(e) =>
                                        setConfirmText(e.target.value)
                                    }
                                    placeholder="RESET"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowResetDialog(false);
                                        setConfirmText("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={
                                        confirmText !== "RESET" ||
                                        operationInProgress
                                    }
                                    onClick={resetDatabase}
                                >
                                    {operationInProgress
                                        ? "Resetting..."
                                        : "Reset Database"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </TooltipProvider>
        </ProtectedRoute>
    );
}

export default DatabaseSandboxPage;
