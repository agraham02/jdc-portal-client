import { ReactNode } from "react";
import {
    FileText,
    Search,
    AlertCircle,
    Inbox,
    Copy,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StandardError } from "@/lib/types/errors";
import { toast } from "sonner";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

/**
 * Generic empty state component
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <Card className={className}>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                    {icon || (
                        <Inbox className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="mb-4 max-w-md text-sm text-muted-foreground">
                    {description}
                </p>
                {action && (
                    <Button onClick={action.onClick}>{action.label}</Button>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Empty state for contracts list
 */
export function NoContractsFound({
    hasFilters,
    onClearFilters,
    onCreateNew,
    canCreate,
}: {
    hasFilters?: boolean;
    onClearFilters?: () => void;
    onCreateNew?: () => void;
    canCreate?: boolean;
}) {
    if (hasFilters && onClearFilters) {
        return (
            <EmptyState
                icon={<Search className="h-8 w-8 text-muted-foreground" />}
                title="No contracts match your filters"
                description="Try adjusting your search criteria or filters to find contracts."
                action={{
                    label: "Clear Filters",
                    onClick: onClearFilters,
                }}
            />
        );
    }

    return (
        <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="No contracts available"
            description={
                canCreate
                    ? "Get started by creating your first contract opportunity."
                    : "There are currently no active contract opportunities. Check back later."
            }
            action={
                canCreate && onCreateNew
                    ? {
                          label: "Create Contract",
                          onClick: onCreateNew,
                      }
                    : undefined
            }
        />
    );
}

/**
 * Error state component with StandardError support
 */
export function ErrorState({
    error,
    title,
    description,
    onRetry,
    showDetails = false,
}: {
    /**
     * StandardError object (preferred) or string description
     */
    error?: StandardError | string | null;
    /**
     * Custom error title (overrides default)
     */
    title?: string;
    /**
     * Custom error description (overrides error.message)
     */
    description?: string;
    /**
     * Retry callback
     */
    onRetry?: () => void;
    /**
     * Show collapsible error details (request ID, details, etc.)
     */
    showDetails?: boolean;
}) {
    // Extract error information
    const standardError =
        typeof error === "object" && error !== null ? error : null;
    const errorMessage =
        description ||
        standardError?.message ||
        (typeof error === "string" ? error : null) ||
        "We encountered an error while loading this content. Please try again.";
    const errorTitle =
        title ||
        (standardError?.code === "NetworkError"
            ? "Network Error"
            : standardError?.code === "Unauthorized"
            ? "Unauthorized"
            : standardError?.code === "Forbidden"
            ? "Access Denied"
            : standardError?.code === "NotFound"
            ? "Not Found"
            : "Something went wrong");

    const hasFieldErrors =
        standardError?.fieldErrors && standardError.fieldErrors.length > 0;
    const hasRequestId = !!standardError?.requestId;
    const hasDetails =
        standardError?.details &&
        Object.keys(standardError.details).length > 0;

    const copyRequestId = () => {
        if (standardError?.requestId) {
            navigator.clipboard.writeText(standardError.requestId);
            toast.success("Request ID copied to clipboard");
        }
    };

    return (
        <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-destructive/10 p-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-destructive">
                    {errorTitle}
                </h3>
                <p className="mb-4 max-w-md text-sm text-muted-foreground">
                    {errorMessage}
                </p>

                {/* Field Errors */}
                {hasFieldErrors && (
                    <div className="mb-4 w-full max-w-md space-y-1 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
                        <p className="text-xs font-medium text-destructive">
                            Validation Errors:
                        </p>
                        {standardError.fieldErrors!.map((fieldError, i) => (
                            <p key={i} className="text-sm text-destructive">
                                <span className="font-medium">
                                    {fieldError.field}:
                                </span>{" "}
                                {fieldError.message}
                            </p>
                        ))}
                    </div>
                )}

                {/* Request ID */}
                {hasRequestId && (
                    <div className="mb-4 flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                            Request ID: {standardError.requestId}
                        </code>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={copyRequestId}
                            className="h-6 w-6 p-0"
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* Error Details (Collapsible) */}
                {showDetails && hasDetails && (
                    <details className="mb-4 w-full max-w-md">
                        <summary className="flex cursor-pointer items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                            <ChevronDown className="h-3 w-3" />
                            Show Error Details
                        </summary>
                        <pre className="mt-2 overflow-auto rounded-lg bg-muted p-3 text-left text-xs">
                            {JSON.stringify(standardError.details, null, 2)}
                        </pre>
                    </details>
                )}

                {onRetry && (
                    <Button onClick={onRetry} variant="outline">
                        Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
