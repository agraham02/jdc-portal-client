"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { HrDocumentsTable } from "@/components/documents/HrDocumentsTable";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Can } from "@/components/authz/Can";
import {
    FolderOpen,
    Upload,
    ArrowLeft,
    FileText,
    Search,
    Filter,
} from "lucide-react";

export default function HRLibraryPage() {
    return (
        <ProtectedRoute anyOf={[P.HR_DOCUMENT_READ]}>
            <main className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            href="/hr-resources"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to HR Resources
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold flex items-center gap-3"
                        >
                            <FolderOpen className="w-8 h-8 text-primary" />
                            HR Document Library
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Browse, search, and manage all HR documents and
                            resources
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-3"
                    >
                        <Can anyOf={[P.HR_DOCUMENT_CREATE]}>
                            <Button asChild className="flex items-center gap-2">
                                <Link href="/hr-resources/upload">
                                    <Upload className="w-4 h-4" />
                                    Upload Document
                                </Link>
                            </Button>
                        </Can>
                    </motion.div>
                </div>

                {/* Quick Info Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid sm:grid-cols-3 gap-4 mb-6"
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Document Library
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground">
                                View, download, and manage all HR documents
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Search className="w-4 h-4 text-green-600" />
                                Search & Filter
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground">
                                Find documents by name, type, or upload date
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Filter className="w-4 h-4 text-purple-600" />
                                Organize
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground">
                                Sort by name, date, size, or file type
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Documents Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>All Documents</CardTitle>
                            <CardDescription>
                                Complete list of HR documents with search,
                                filter, and management options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <HrDocumentsTable />
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </ProtectedRoute>
    );
}
