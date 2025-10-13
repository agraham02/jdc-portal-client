"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { apiClient } from "@/lib/api";
import { apiToast } from "@/lib/utils/toast-helpers";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

    return (
        <ProtectedRoute anyOf={[P.ADMIN_DATABASE_READ]}>
            <div className="space-y-6">
                {/* Warning Banner */}
                <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="flex items-start gap-3 p-4">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
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
                    </CardContent>
                </Card>

                {/* Header with Actions */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">Database Sandbox</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and inspect your MongoDB database
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={fetchStats}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Database Overview */}
                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Database
                                            </p>
                                            <p className="text-2xl font-bold mt-1">
                                                {stats.databaseName}
                                            </p>
                                        </div>
                                        <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Collections
                                            </p>
                                            <p className="text-2xl font-bold mt-1">
                                                {stats.totalCollections}
                                            </p>
                                        </div>
                                        <FileStack className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Documents
                                            </p>
                                            <p className="text-2xl font-bold mt-1">
                                                {stats.totalDocuments.toLocaleString()}
                                            </p>
                                        </div>
                                        <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Size
                                            </p>
                                            <p className="text-2xl font-bold mt-1">
                                                {formatBytes(stats.totalSize)}
                                            </p>
                                        </div>
                                        <HardDrive className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Danger Zone */}
                        <Card className="border-red-500">
                            <CardHeader>
                                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Danger Zone
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">
                                            Clear All Collections
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Delete all documents from all
                                            collections (keeps structure)
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            setShowClearAllDialog(true)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear All
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">
                                            Reset Database
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Reset database to clean state
                                            (clears all data)
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowResetDialog(true)}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Collections Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Collections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {stats.collections.map((collection) => (
                                        <div
                                            key={collection.name}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-medium">
                                                        {collection.name}
                                                    </h3>
                                                    <Badge variant="secondary">
                                                        {collection.count.toLocaleString()}{" "}
                                                        docs
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {formatBytes(
                                                            collection.size
                                                        )}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {collection.indexes}{" "}
                                                        indexes
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Avg size:{" "}
                                                    {formatBytes(
                                                        collection.avgObjSize
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        fetchCollectionDetails(
                                                            collection.name
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const fromStats = (
                                                            cs: CollectionStats
                                                        ): CollectionDetails => ({
                                                            name: cs.name,
                                                            count: cs.count,
                                                            size: cs.size,
                                                            avgObjSize:
                                                                cs.avgObjSize,
                                                            storageSize: 0,
                                                            indexes: [],
                                                            sampleDocuments: [],
                                                        });
                                                        setSelectedCollection(
                                                            fromStats(
                                                                collection
                                                            )
                                                        );
                                                        setShowClearDialog(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

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
                                <strong>{selectedCollection?.name}</strong> but
                                keep the collection structure and indexes.
                            </DialogDescription>
                        </DialogHeader>
                        <div>
                            <p className="text-sm mb-2">
                                Type <strong>CLEAR</strong> to confirm:
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
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
                <Dialog open={showDropDialog} onOpenChange={setShowDropDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Drop Collection</DialogTitle>
                            <DialogDescription>
                                This will permanently delete the entire{" "}
                                <strong>{selectedCollection?.name}</strong>{" "}
                                collection, including all documents, indexes,
                                and structure. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div>
                            <p className="text-sm mb-2">
                                Type <strong>DROP</strong> to confirm:
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
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
                                onChange={(e) => setConfirmText(e.target.value)}
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
                                This will reset the database to a clean state by
                                deleting all documents from all collections.
                                Collection structures and indexes will be
                                preserved.
                            </DialogDescription>
                        </DialogHeader>
                        <div>
                            <p className="text-sm mb-2">
                                Type <strong>RESET</strong> to confirm:
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
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
        </ProtectedRoute>
    );
}

export default DatabaseSandboxPage;
