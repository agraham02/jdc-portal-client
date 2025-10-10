"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PermissionBadgeProps {
    permission: string;
    variant?: "badge" | "icon" | "inline";
    showLabel?: boolean;
}

/**
 * Visual indicator showing if user has a specific permission
 * Useful for debugging and showing permission states in admin UIs
 */
export function PermissionBadge({
    permission,
    variant = "badge",
    showLabel = true,
}: PermissionBadgeProps) {
    const { hasPermission } = useAuth();
    const allowed = hasPermission(permission);

    if (variant === "icon") {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex items-center">
                            {allowed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">
                            {allowed ? "Allowed" : "Restricted"}:{" "}
                            <code>{permission}</code>
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (variant === "inline") {
        return (
            <span className="inline-flex items-center gap-1 text-xs">
                {allowed ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                    <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                )}
                {showLabel && (
                    <span
                        className={
                            allowed
                                ? "text-green-700 dark:text-green-300"
                                : "text-red-700 dark:text-red-300"
                        }
                    >
                        {allowed ? "Allowed" : "Restricted"}
                    </span>
                )}
            </span>
        );
    }

    return (
        <Badge
            variant={allowed ? "default" : "destructive"}
            className="text-xs"
        >
            {allowed ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
                <XCircle className="h-3 w-3 mr-1" />
            )}
            {allowed ? "Allowed" : "Restricted"}
        </Badge>
    );
}

interface PermissionRequiredIndicatorProps {
    permission: string;
    children: React.ReactNode;
    /**
     * If true, shows a tooltip on disabled elements explaining why
     * If false, hides the element entirely when permission is missing
     */
    showTooltip?: boolean;
}

/**
 * Wraps an interactive element (button, link) and adds a tooltip
 * explaining the required permission when disabled
 */
export function PermissionRequiredIndicator({
    permission,
    children,
    showTooltip = true,
}: PermissionRequiredIndicatorProps) {
    const { hasPermission } = useAuth();
    const allowed = hasPermission(permission);

    if (!allowed && !showTooltip) {
        return null;
    }

    if (!allowed && showTooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex">{children}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-xs font-medium">
                                    Permission Required
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    You need{" "}
                                    <code className="px-1 py-0.5 bg-muted rounded">
                                        {permission}
                                    </code>{" "}
                                    permission to perform this action.
                                </p>
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return <>{children}</>;
}
