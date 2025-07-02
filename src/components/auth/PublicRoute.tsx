"use client";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { useAuth, UserRole } from "@/lib/contexts/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PublicRouteProps {
    children: ReactNode;
    redirectIfAuthenticated?: boolean;
    redirectPath?: string;
}

export function PublicRoute({
    children,
    redirectIfAuthenticated = true,
    redirectPath,
}: PublicRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (redirectIfAuthenticated && isAuthenticated && user) {
        const defaultRedirectPath = getDashboardPath(user.role);
        redirect(redirectPath || defaultRedirectPath);
    }

    return <>{children}</>;
}

function getDashboardPath(role: UserRole): string {
    switch (role) {
        case UserRole.ADMIN:
            return "/admin/dashboard";
        case UserRole.EMPLOYEE:
            return "/employee/dashboard";
        case UserRole.VENDOR:
            return "/vendor/dashboard";
        default:
            return "/dashboard";
    }
}
