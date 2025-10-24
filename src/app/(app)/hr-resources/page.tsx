"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HrDocumentsService } from "@/lib/services/file";
import { HRDocument } from "@/lib/types/file";
import {
    FileText,
    Clock,
    Download,
    Link as LinkIcon,
} from "lucide-react";
import { HrDocumentsTable } from "@/components/documents/HrDocumentsTable";
import { HrLinksTable } from "@/components/documents/HrLinksTable";

// TODO: update page to align with new isPublic logic structure

export default function HRResourcesPage() {
    const [activeTab, setActiveTab] = useState<"documents" | "links">(
        "documents"
    );
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

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Get total documents count
                const totalResponse = await HrDocumentsService.getFiles({
                    page: 1,
                    limit: 1,
                });

                // Get recent documents (last 5)
                const recentResponse = await HrDocumentsService.getFiles({
                    page: 1,
                    limit: 5,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });

                // Calculate recent uploads (documents from last 7 days)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentUploads = recentResponse.files.filter(
                    (file: HRDocument) =>
                        new Date(file.createdAt) > sevenDaysAgo
                ).length;

                setStats({
                    totalDocuments: totalResponse.total,
                    recentUploads,
                    totalDownloads: Math.floor(totalResponse.total * 2.3), // Simulated metric
                    loading: false,
                });
            } catch (error) {
                console.error("Failed to load HR stats:", error);
                setStats((prev) => ({ ...prev, loading: false }));
            }
        };

        loadStats();
    }, []);

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
    ];

    return (
        <ProtectedRoute anyOf={[P.HR_DOCUMENT_READ]}>
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
                            Manage and access HR documents, links, and resources
                        </motion.p>
                    </div>
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

                {/* Tabs for Documents and Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4 border-b">
                                <button
                                    onClick={() => setActiveTab("documents")}
                                    className={`pb-3 px-4 font-medium transition-colors relative ${
                                        activeTab === "documents"
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Documents
                                    </div>
                                    {activeTab === "documents" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab("links")}
                                    className={`pb-3 px-4 font-medium transition-colors relative ${
                                        activeTab === "links"
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4" />
                                        Links
                                    </div>
                                    {activeTab === "links" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                    )}
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            {activeTab === "documents" && <HrDocumentsTable />}
                            {activeTab === "links" && <HrLinksTable />}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </ProtectedRoute>
    );
}
