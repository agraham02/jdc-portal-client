"use client";

import Link from "next/link";
import useSWR from "swr";
import { motion } from "motion/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmployeeService } from "@/lib/services/employee";
import { pageTransition } from "@/lib/animations";
import { Users } from "lucide-react";

/**
 * My Team page — lists the authenticated user's direct reports.
 *
 * Access is implicit: the endpoint returns an empty list for users who have
 * no reports, so we do not gate the route on a specific permission.
 */
export default function MyTeamPage() {
    const { data, isLoading, error } = useSWR(
        "/employees/me/reports",
        () => EmployeeService.getMyReports({ page: 1, limit: 50 }),
        { revalidateOnFocus: false },
    );

    const reports = data?.data ?? [];

    return (
        <ProtectedRoute>
            <motion.main
                className="max-w-5xl mx-auto p-6 space-y-6"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
                <div className="flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    <div>
                        <h1 className="text-2xl font-semibold">My Team</h1>
                        <p className="text-sm text-muted-foreground">
                            Your direct reports. Click a report to view or edit
                            their profile.
                        </p>
                    </div>
                </div>

                {isLoading && (
                    <p className="text-muted-foreground">Loading team…</p>
                )}

                {error && (
                    <p className="text-destructive">
                        Failed to load your reports.
                    </p>
                )}

                {!isLoading && !error && reports.length === 0 && (
                    <Card className="p-6 text-center text-muted-foreground">
                        You currently have no direct reports.
                    </Card>
                )}

                {reports.length > 0 && (
                    <div className="grid gap-3">
                        {reports.map((r) => {
                            const fullName =
                                [r.userId?.firstName, r.userId?.lastName]
                                    .filter(Boolean)
                                    .join(" ") || r.userId?.email;
                            return (
                                <Link
                                    key={r._id}
                                    href={`/employees/${r._id}`}
                                    className="block"
                                >
                                    <Card className="p-4 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium">
                                                    {fullName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {r.jobTitle ||
                                                        "No job title"}
                                                    {r.department
                                                        ? ` • ${r.department}`
                                                        : ""}
                                                </p>
                                            </div>
                                            {r.userId?.status && (
                                                <Badge variant="secondary">
                                                    {r.userId.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </motion.main>
        </ProtectedRoute>
    );
}
