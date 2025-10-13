"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PermissionRequiredBannerProps {
    /**
     * Single permission or array of permissions required
     */
    permissions: string | string[];
    /**
     * If true, requires ALL permissions (AND logic)
     * If false, requires ANY permission (OR logic)
     */
    requireAll?: boolean;
    /**
     * Custom message to display
     */
    message?: string;
    /**
     * Show contact admin suggestion
     */
    showContactAdmin?: boolean;
}

/**
 * Banner component that displays at the top of pages requiring specific permissions
 * Shows when user lacks the required permission(s)
 */
export function PermissionRequiredBanner({
    permissions,
    requireAll = false,
    message,
    showContactAdmin = true,
}: PermissionRequiredBannerProps) {
    const { hasPermission } = useAuth();

    const permissionArray = Array.isArray(permissions)
        ? permissions
        : [permissions];

    // Check if user has required permissions
    const hasAccess = requireAll
        ? permissionArray.every((p) => hasPermission(p))
        : permissionArray.some((p) => hasPermission(p));

    // Don't show banner if user has access
    if (hasAccess) {
        return null;
    }

    return (
        <Alert
            variant="default"
            className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
        >
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">
                Permission Required
            </AlertTitle>
            <AlertDescription className="space-y-2">
                <p className="text-amber-800 dark:text-amber-200">
                    {message ||
                        `This ${
                            permissionArray.length > 1
                                ? "requires"
                                : "requires the"
                        } following permission${
                            permissionArray.length > 1 ? "s" : ""
                        }:`}
                </p>
                <div className="flex flex-wrap gap-2">
                    {permissionArray.map((perm) => (
                        <Badge
                            key={perm}
                            variant="outline"
                            className="font-mono text-xs bg-white dark:bg-gray-900"
                        >
                            {perm}
                        </Badge>
                    ))}
                </div>
                {showContactAdmin && (
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                        Contact your administrator if you need access to this
                        feature.
                    </p>
                )}
            </AlertDescription>
        </Alert>
    );
}

interface RestrictedAccessBannerProps {
    title?: string;
    description?: string;
}

/**
 * Generic banner for restricted access (simpler version)
 */
export function RestrictedAccessBanner({
    title = "Access Restricted",
    description = "You don't have permission to access this resource.",
}: RestrictedAccessBannerProps) {
    return (
        <Alert
            variant="default"
            className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
        >
            <Info className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-900 dark:text-red-100">
                {title}
            </AlertTitle>
            <AlertDescription className="text-red-800 dark:text-red-200">
                {description}
            </AlertDescription>
        </Alert>
    );
}
