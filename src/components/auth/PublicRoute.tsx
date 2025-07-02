"use client";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { AccountType } from "@/lib/types/auth";
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
        const defaultRedirectPath = getDashboardPath(user.accountType);
        redirect(redirectPath || defaultRedirectPath);
    }

    return <>{children}</>;
}

function getDashboardPath(accountType: AccountType): string {
    switch (accountType) {
        case AccountType.ADMIN:
            return "/admin/dashboard";
        case AccountType.EMPLOYEE:
            return "/employee/dashboard";
        case AccountType.VENDOR:
            return "/vendor/dashboard";
        case AccountType.HOUSING_TENANT:
            return "/tenant/dashboard";
        default:
            return "/dashboard";
    }
}
