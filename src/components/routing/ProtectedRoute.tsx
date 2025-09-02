"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { useAuthz } from "@/lib/authz/useAuthz";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AccountStatusPage } from "@/components/auth/AccountStatus";
import type { RoleName } from "@/lib/types/auth";

type ProtectedRouteProps = {
    children: React.ReactNode;
    anyOf?: string[];
    allOf?: string[];
    // Backwards-compat: treat as allOf if provided
    requiredPermissions?: string[];
    requiredRoles?: RoleName | RoleName[];
    // When true, require an authenticated user; otherwise allow anonymous and only gate by permissions (useful for public pages with limited actions)
    requireAuth?: boolean;
    // When true and requireAuth, show account status page for inactive accounts
    requireActiveAccount?: boolean;
    fallback?: React.ReactNode;
};

export function ProtectedRoute({
    children,
    anyOf,
    allOf,
    requiredPermissions,
    requiredRoles,
    requireAuth = true,
    requireActiveAccount = true,
    fallback = <AccessDenied />,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, hasRole, isAccountActive } = useAuth();
    const { loading: authzLoading, hasAny, hasAll } = useAuthz();

    // Redirect unauthenticated users to landing
    useEffect(() => {
        if (!isLoading && requireAuth && !isAuthenticated) {
            router.push("/");
        }
    }, [isLoading, requireAuth, isAuthenticated, router]);

    // Loading states
    if (isLoading || authzLoading) return <LoadingSpinner />;
    if (requireAuth && !isAuthenticated) return <LoadingSpinner />;

    // Account status gating (only when auth is required)
    if (requireAuth && requireActiveAccount && user && !isAccountActive()) {
        return <AccountStatusPage user={user} />;
    }

    // Role checks (optional)
    if (requiredRoles && !hasRole(requiredRoles)) {
        return <>{fallback}</>;
    }

    // Permission checks
    const mergedAllOf = [
        ...(allOf ?? []),
        ...(requiredPermissions ?? []),
    ];
    const allowedAny = anyOf ? hasAny(anyOf) : true;
    const allowedAll = mergedAllOf.length ? hasAll(mergedAllOf) : true;
    const allowed = allowedAny && allowedAll;
    if (!allowed) return <>{fallback}</>;

    return <>{children}</>;
}
