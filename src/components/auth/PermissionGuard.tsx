"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/contexts/auth-context";

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
    const { hasPermission } = useAuth();

    const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

    const hasAccess = requireAll
        ? permissions.every((permission) => hasPermission(permission))
        : permissions.some((permission) => hasPermission(permission));

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
