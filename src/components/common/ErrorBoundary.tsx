"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        if (
            this.state.hasError &&
            this.props.resetKeys &&
            prevProps.resetKeys &&
            this.props.resetKeys.some(
                (key, index) => key !== prevProps.resetKeys?.[index]
            )
        ) {
            this.reset();
        }
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] items-center justify-center p-6">
                    <Card className="max-w-lg border-destructive">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                                <CardTitle className="text-destructive">
                                    Something went wrong
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                An unexpected error occurred while rendering
                                this component.
                            </p>
                            {this.state.error && (
                                <details className="rounded-lg bg-muted p-4 text-sm">
                                    <summary className="cursor-pointer font-medium">
                                        Error Details
                                    </summary>
                                    <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button onClick={this.reset} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="default"
                            >
                                Reload Page
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
 * Lightweight error fallback for smaller components
 */
export function ErrorFallback({
    error,
    resetError,
}: {
    error: Error;
    resetError: () => void;
}) {
    return (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-destructive">
                        Error loading component
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {error.message}
                    </p>
                    <Button size="sm" variant="outline" onClick={resetError}>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Retry
                    </Button>
                </div>
            </div>
        </div>
    );
}
