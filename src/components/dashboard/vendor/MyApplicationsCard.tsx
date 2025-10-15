"use client";

import { BaseDashboardCard } from "../BaseDashboardCard";
import useSWR from "swr";
import { ApplicationsService } from "@/lib/services/contracts";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileCheck } from "lucide-react";
import Link from "next/link";
import { ApplicationStatus, type Application } from "@/lib/types/contracts";

/**
 * MyApplicationsCard shows vendor's application status summary
 */
export function MyApplicationsCard() {
    const { data, error } = useSWR("/my-applications-summary", async () => {
        const result = await ApplicationsService.getMyApplications({
            limit: 100, // Get all to count by status
            page: 1,
        });
        const apps = result.data || [];

        return {
            total: apps.length,
            submitted: apps.filter(
                (a: Application) => a.status === ApplicationStatus.SUBMITTED
            ).length,
            inReview: apps.filter(
                (a: Application) => a.status === ApplicationStatus.REVIEWED
            ).length,
            accepted: apps.filter(
                (a: Application) => a.status === ApplicationStatus.ACCEPTED
            ).length,
            rejected: apps.filter(
                (a: Application) => a.status === ApplicationStatus.REJECTED
            ).length,
        };
    });

    const isLoading = !data;

    return (
        <BaseDashboardCard
            title="My Applications"
            isLoading={isLoading}
            error={error?.message}
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/contracts/my-applications">
                        View All
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            }
        >
            {data && data.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileCheck className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No applications yet
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm font-medium">
                            Total Applications
                        </span>
                        <span className="text-2xl font-bold">
                            {data?.total || 0}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">
                                Submitted
                            </p>
                            <p className="text-lg font-semibold">
                                {data?.submitted || 0}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">
                                In Review
                            </p>
                            <p className="text-lg font-semibold">
                                {data?.inReview || 0}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950">
                            <p className="text-xs text-green-700 dark:text-green-300">
                                Accepted
                            </p>
                            <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                                {data?.accepted || 0}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-950">
                            <p className="text-xs text-red-700 dark:text-red-300">
                                Rejected
                            </p>
                            <p className="text-lg font-semibold text-red-900 dark:text-red-100">
                                {data?.rejected || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </BaseDashboardCard>
    );
}
