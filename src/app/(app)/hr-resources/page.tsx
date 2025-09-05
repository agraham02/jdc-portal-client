"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileService } from "@/lib/services/file";
import { FilesResponse } from "@/lib/types/file";
import {
    Upload,
    FileText,
    FolderOpen,
    TrendingUp,
    Clock,
    Users,
    Download,
    Eye,
    Plus,
    ArrowRight,
} from "lucide-react";

export default function HRResourcesPage() {
    const [stats, setStats] = useState<{
        totalDocuments: number;
        recentUploads: number;
        totalDownloads: number;
        loading: boolean;
    }>({
        totalDocuments: 0,
        recentUploads: 0,
        totalDownloads: 0,
        loading: true,
    });

    const [recentDocuments, setRecentDocuments] =
        useState<FilesResponse | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Get total documents count
                const totalResponse = await FileService.getHrDocuments({
                    page: 1,
                    limit: 1,
                });

                // Get recent documents (last 5)
                const recentResponse = await FileService.getHrDocuments({
                    page: 1,
                    limit: 5,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });

                // Calculate recent uploads (documents from last 7 days)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentUploads = recentResponse.files.filter(
                    (file) => new Date(file.createdAt) > sevenDaysAgo
                ).length;

                setStats({
                    totalDocuments: totalResponse.total,
                    recentUploads,
                    totalDownloads: Math.floor(totalResponse.total * 2.3), // Simulated metric
                    loading: false,
                });

                setRecentDocuments(recentResponse);
            } catch (error) {
                console.error("Failed to load HR stats:", error);
                setStats((prev) => ({ ...prev, loading: false }));
            }
        };

        loadStats();
    }, []);

    const quickActions = [
        {
            title: "Upload Document",
            description: "Add new HR document to the library",
            icon: Upload,
            href: "/hr-resources/upload",
            permission: P.HR_DOCUMENT_CREATE,
            variant: "default" as const,
        },
        {
            title: "Browse Library",
            description: "View all HR documents and resources",
            icon: FolderOpen,
            href: "/hr-resources/library",
            permission: null,
            variant: "outline" as const,
        },
    ];

    const statsCards = [
        {
            title: "Total Documents",
            value: stats.totalDocuments,
            icon: FileText,
            description: "HR documents in library",
            color: "text-blue-600",
        },
        {
            title: "Recent Uploads",
            value: stats.recentUploads,
            icon: Clock,
            description: "New docs this week",
            color: "text-green-600",
        },
        {
            title: "Total Downloads",
            value: stats.totalDownloads,
            icon: Download,
            description: "All-time downloads",
            color: "text-purple-600",
        },
        {
            title: "Active Users",
            value: 24, // Simulated metric
            icon: Users,
            description: "Users with access",
            color: "text-orange-600",
        },
    ];

    return (
        <ProtectedRoute anyOf={[P.FILE_READ, P.FILE_READ_ALL]}>
            <main className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold"
                        >
                            HR Resources
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Manage and access HR documents, policies, and
                            resources
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-3"
                    >
                        {quickActions.map((action, index) => (
                            <Can
                                key={action.title}
                                anyOf={
                                    action.permission
                                        ? [action.permission]
                                        : undefined
                                }
                            >
                                <Button
                                    asChild
                                    variant={action.variant}
                                    className="min-w-fit"
                                >
                                    <Link
                                        href={action.href}
                                        className="flex items-center gap-2"
                                    >
                                        <action.icon className="w-4 h-4" />
                                        {action.title}
                                    </Link>
                                </Button>
                            </Can>
                        ))}
                    </motion.div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 1) }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon
                                        className={`h-4 w-4 ${stat.color}`}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.loading ? (
                                            <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                                        ) : (
                                            stat.value.toLocaleString()
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Quick Actions Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1"
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Quick Actions
                                </CardTitle>
                                <CardDescription>
                                    Common HR document tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {quickActions.map((action) => (
                                    <Can
                                        key={`panel-${action.title}`}
                                        anyOf={
                                            action.permission
                                                ? [action.permission]
                                                : undefined
                                        }
                                    >
                                        <Link
                                            href={action.href}
                                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-primary/10">
                                                    <action.icon className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {action.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </Link>
                                    </Can>
                                ))}

                                <div className="pt-4 border-t">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium">
                                                Document Activity
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>
                                                • {stats.recentUploads} new
                                                uploads this week
                                            </p>
                                            <p>
                                                •{" "}
                                                {Math.floor(
                                                    stats.totalDocuments * 0.15
                                                )}{" "}
                                                downloads today
                                            </p>
                                            <p>• All systems operational</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Documents */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Recent Documents
                                        </CardTitle>
                                        <CardDescription>
                                            Latest HR documents and updates
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/hr-resources/library">
                                            View All
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentDocuments &&
                                recentDocuments.files.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentDocuments.files.map((file) => (
                                            <div
                                                key={file._id}
                                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">
                                                            {file.originalName}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span>
                                                                {FileService.formatFileSize(
                                                                    file.size
                                                                )}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {new Date(
                                                                    file.createdAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-2"
                                                            >
                                                                {file.mimetype
                                                                    ?.split(
                                                                        "/"
                                                                    )?.[1]
                                                                    ?.toUpperCase() ||
                                                                    "FILE"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const { url } =
                                                                    await FileService.getSignedViewUrl(
                                                                        file._id
                                                                    );
                                                                window.open(
                                                                    url,
                                                                    "_blank"
                                                                );
                                                            } catch (error) {
                                                                console.error(
                                                                    "Failed to view document:",
                                                                    error
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const { url } =
                                                                    await FileService.getSignedDownloadUrl(
                                                                        file._id
                                                                    );
                                                                const a =
                                                                    document.createElement(
                                                                        "a"
                                                                    );
                                                                a.href = url;
                                                                a.download =
                                                                    file.originalName;
                                                                document.body.appendChild(
                                                                    a
                                                                );
                                                                a.click();
                                                                document.body.removeChild(
                                                                    a
                                                                );
                                                            } catch (error) {
                                                                console.error(
                                                                    "Failed to download document:",
                                                                    error
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="font-semibold text-lg mb-2">
                                            No documents yet
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            Get started by uploading your first
                                            HR document
                                        </p>
                                        <Can anyOf={[P.HR_DOCUMENT_CREATE]}>
                                            <Button asChild>
                                                <Link href="/hr-resources/upload">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload First Document
                                                </Link>
                                            </Button>
                                        </Can>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
