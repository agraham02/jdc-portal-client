"use client";

import { ReactNode } from "react";
import { useAuthz } from "@/lib/authz/useAuthz";

interface PermissionGuardProps {
    children: ReactNode;
    requiredPermissions: string | string[];
    requireAll?: boolean;
    fallback?: ReactNode;
}

export function PermissionGuard({
    children,
    requiredPermissions,
    requireAll = true,
    fallback = null,
}: PermissionGuardProps) {
    const { hasAll, hasAny } = useAuthz();

    const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

    const hasAccess = requireAll ? hasAll(permissions) : hasAny(permissions);

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
