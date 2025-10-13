"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { logger } from "@/lib/utils/logger";

interface RouteErrorBoundaryProps {
    children: ReactNode;
    /**
     * Custom fallback UI to display when an error occurs
     */
    fallback?: (error: Error, resetError: () => void) => ReactNode;
    /**
     * Callback when an error is caught
     */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    /**
     * Custom title for the error display
     */
    errorTitle?: string;
    /**
     * Custom description for the error display
     */
    errorDescription?: string;
}

interface RouteErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component for catching and displaying route-level errors
 *
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 *
 * @example
 * ```tsx
 * // Wrap a route or component
 * <RouteErrorBoundary>
 *   <YourComponent />
 * </RouteErrorBoundary>
 *
 * // With custom error handling
 * <RouteErrorBoundary
 *   errorTitle="Failed to load contract"
 *   onError={(error) => analytics.trackError(error)}
 * >
 *   <ContractDetail />
 * </RouteErrorBoundary>
 *
 * // With custom fallback UI
 * <RouteErrorBoundary
 *   fallback={(error, reset) => (
 *     <CustomErrorDisplay error={error} onRetry={reset} />
 *   )}
 * >
 *   <YourComponent />
 * </RouteErrorBoundary>
 * ```
 */
export class RouteErrorBoundary extends Component<
    RouteErrorBoundaryProps,
    RouteErrorBoundaryState
> {
    constructor(props: RouteErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console and external service
        logger.error("RouteErrorBoundary caught an error", {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }

    private resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    private handleReload = () => {
        this.resetError();
        // Force a full page reload to reset state
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = "/dashboard";
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.resetError);
            }

            // Default error UI
            return (
                <div className="flex min-h-[400px] items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <CardTitle>
                                    {this.props.errorTitle ||
                                        "Something went wrong"}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {this.props.errorDescription ||
                                    "An unexpected error occurred while loading this page. Please try again."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md bg-muted p-3">
                                <p className="text-sm font-mono text-muted-foreground break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                onClick={this.resetError}
                                variant="default"
                                className="flex-1"
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                variant="outline"
                                className="flex-1"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Functional wrapper for RouteErrorBoundary with preset configurations
 */
export function ContractErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <RouteErrorBoundary
            errorTitle="Failed to load contract"
            errorDescription="There was an error loading the contract details. This might be due to a network issue or the contract no longer exists."
        >
            {children}
        </RouteErrorBoundary>
    );
}

export function VendorErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <RouteErrorBoundary
            errorTitle="Failed to load vendor data"
            errorDescription="There was an error loading vendor information. Please check your connection and try again."
        >
            {children}
        </RouteErrorBoundary>
    );
}

export function UserErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <RouteErrorBoundary
            errorTitle="Failed to load user data"
            errorDescription="There was an error loading user information. Please refresh the page or contact support if the issue persists."
        >
            {children}
        </RouteErrorBoundary>
    );
}
