"use client";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { RoleName } from "@/lib/types/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { AccountStatusPage } from "@/components/auth/AccountStatus";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRoles?: RoleName | RoleName[];
    requiredPermissions?: string[];
    requireActiveAccount?: boolean;
    fallback?: ReactNode;
}

export function ProtectedRoute({
    children,
    requiredRoles,
    requiredPermissions,
    requireActiveAccount = true,
    fallback = <AccessDenied />,
}: ProtectedRouteProps) {
    const {
        user,
        isLoading,
        isAuthenticated,
        hasRole,
        hasPermission,
        isAccountActive,
    } = useAuth();

    // Show loading while checking auth status
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        redirect("/login");
    }

    // Check if account is active (if required)
    if (requireActiveAccount && !isAccountActive()) {
        return <AccountStatusPage user={user} />;
    }

    // Check role requirements
    if (requiredRoles && !hasRole(requiredRoles)) {
        return fallback;
    }

    // Check permission requirements
    if (requiredPermissions) {
        const hasAllPermissions = requiredPermissions.every((permission) =>
            hasPermission(permission)
        );
        if (!hasAllPermissions) {
            return fallback;
        }
    }

    return <>{children}</>;
}
