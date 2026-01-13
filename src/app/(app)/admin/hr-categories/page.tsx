"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { motion } from "motion/react";
import { HrCategoriesTable } from "@/components/admin/HrCategoriesTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HrCategoriesPage() {
    return (
        <ProtectedRoute anyOf={[P.HR_DOCUMENT_CREATE, P.HR_DOCUMENT_UPDATE]}>
            <main className="space-y-6 p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Admin
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold"
                        >
                            HR Categories
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Manage categories for organizing HR links and
                            documents
                        </motion.p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <HrCategoriesTable />
                </motion.div>
            </main>
        </ProtectedRoute>
    );
}
