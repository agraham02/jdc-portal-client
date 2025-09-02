"use client";

import React from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useAuthz } from "@/lib/authz/useAuthz";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type ProtectedRouteProps = {
    children: React.ReactNode;
    anyOf?: string[];
    allOf?: string[];
    // When true, require an authenticated user; otherwise allow anonymous and only gate by permissions (useful for public pages with limited actions)
    requireAuth?: boolean;
    fallback?: React.ReactNode;
};

export function ProtectedRoute({
    children,
    anyOf,
    allOf,
    requireAuth = true,
    fallback = <AccessDenied />,
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const { loading: authzLoading, hasAny, hasAll } = useAuthz();

    if (isLoading || authzLoading) return <LoadingSpinner />;

    if (requireAuth && !isAuthenticated) return <AccessDenied />;

    const allowedAny = anyOf ? hasAny(anyOf) : true;
    const allowedAll = allOf ? hasAll(allOf) : true;
    const allowed = allowedAny && allowedAll;
    if (!allowed) return <>{fallback}</>;
    return <>{children}</>;
}
