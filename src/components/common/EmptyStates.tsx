import { ReactNode } from "react";
import {
    FileText,
    Search,
    AlertCircle,
    Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
 * Error state component
 */
export function ErrorState({
    title = "Something went wrong",
    description = "We encountered an error while loading this content. Please try again.",
    onRetry,
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
}) {
    return (
        <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-destructive/10 p-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-destructive">
                    {title}
                </h3>
                <p className="mb-4 max-w-md text-sm text-muted-foreground">
                    {description}
                </p>
                {onRetry && (
                    <Button onClick={onRetry} variant="outline">
                        Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
