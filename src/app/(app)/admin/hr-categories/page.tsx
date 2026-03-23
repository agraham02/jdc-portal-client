"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { motion } from "motion/react";
import { pageTransition } from "@/lib/animations";
import { HrCategoriesTable } from "@/components/admin/HrCategoriesTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HrCategoriesPage() {
    return (
        <ProtectedRoute anyOf={[P.HR_DOCUMENT_CREATE, P.HR_DOCUMENT_UPDATE]}>
            <motion.main
                className="space-y-6 p-6 max-w-6xl mx-auto"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
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
                        <h1 className="text-3xl font-bold">HR Categories</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage categories for organizing HR links and
                            documents
                        </p>
                    </div>
                </div>

                <HrCategoriesTable />
            </motion.main>
        </ProtectedRoute>
    );
}
