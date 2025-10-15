"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseDashboardCardProps {
    title: string;
    children: ReactNode;
    isLoading?: boolean;
    error?: string | null;
    className?: string;
    action?: ReactNode;
}

/**
 * BaseDashboardCard provides consistent structure, loading states, and error handling
 * for all dashboard cards. Follows shadcn/ui patterns and responsive design.
 */
export function BaseDashboardCard({
    title,
    children,
    isLoading = false,
    error = null,
    className,
    action,
}: BaseDashboardCardProps) {
    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                {action && (
                    <div className="flex items-center gap-2">{action}</div>
                )}
            </CardHeader>
            <CardContent className="flex-1">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}
