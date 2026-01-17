"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/contexts/auth-context";

interface PermissionGateProps {
    /**
     * Single permission or array of permissions required
     */
    permissions: string | string[];
    /**
     * If true, requires ALL permissions (AND logic)
     * If false (default), requires ANY permission (OR logic)
     */
    requireAll?: boolean;
    /**
     * Content to render when user has permission
     */
    children: ReactNode;
    /**
     * Optional fallback content when user lacks permission
     * If not provided, nothing is rendered
     */
    fallback?: ReactNode;
}

/**
 * PermissionGate conditionally renders children based on user permissions.
 * Use this to hide UI elements the user doesn't have access to.
 *
 * @example
 * ```tsx
 * <PermissionGate permissions="users:read">
 *   <UserList />
 * </PermissionGate>
 *
 * <PermissionGate permissions={["users:read", "users:write"]} requireAll>
 *   <UserEditor />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
    permissions,
    requireAll = false,
    children,
    fallback = null,
}: PermissionGateProps) {
    const { hasPermission, isLoading } = useAuth();

    // Don't render anything while loading to prevent flicker
    if (isLoading) {
        return null;
    }

    const permissionArray = Array.isArray(permissions)
        ? permissions
        : [permissions];

    const hasAccess = requireAll
        ? permissionArray.every((p) => hasPermission(p))
        : permissionArray.some((p) => hasPermission(p));

    if (hasAccess) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}

/**
 * Hook version for more complex conditional logic
 */
export function useHasPermission(
    permissions: string | string[],
    requireAll = false
): boolean {
    const { hasPermission, isLoading } = useAuth();

    if (isLoading) {
        return false;
    }

    const permissionArray = Array.isArray(permissions)
        ? permissions
        : [permissions];

    return requireAll
        ? permissionArray.every((p) => hasPermission(p))
        : permissionArray.some((p) => hasPermission(p));
}
