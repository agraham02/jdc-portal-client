"use client";

import { motion } from "motion/react";
import { useAuth } from "@/lib/contexts/auth-context";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { VendorDashboard } from "@/components/dashboard/VendorDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { pageTransition } from "@/lib/animations";

/**
 * Dynamic dashboard page that renders account-specific layouts
 * based on the user's computed account type from AuthContext
 */
export default function DashboardPage() {
    const { accountType, isLoading } = useAuth();

    // Show loading state while account type is being determined
    if (isLoading || !accountType) {
        return (
            <main className="container mx-auto p-6 space-y-6">
                <div className="space-y-3">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </main>
        );
    }

    // Render account-specific dashboard
    return (
        <motion.main
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            className="container mx-auto p-6"
        >
            {accountType === "Admin" && <AdminDashboard />}
            {accountType === "Vendor" && <VendorDashboard />}
            {accountType === "Employee" && <EmployeeDashboard />}
            {!["Admin", "Vendor", "Employee"].includes(accountType) && (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome! Your dashboard will appear here once your
                        account is fully configured.
                    </p>
                </div>
            )}
        </motion.main>
    );
}
