"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { pageTransition } from "@/lib/animations";

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to external service
        console.error("[App Error]", error);
    }, [error]);

    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            className="flex min-h-[600px] flex-col items-center justify-center gap-6 px-4"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-destructive/10 p-3">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-semibold">Application Error</h2>
                <p className="max-w-md text-muted-foreground">
                    {error.message ||
                        "Something went wrong while loading this page."}
                </p>
                {process.env.NODE_ENV === "development" && error.stack && (
                    <details className="mt-4 max-w-2xl text-left">
                        <summary className="cursor-pointer text-sm font-medium">
                            Stack Trace
                        </summary>
                        <pre className="mt-2 overflow-auto rounded-md bg-muted p-4 text-xs">
                            {error.stack}
                        </pre>
                    </details>
                )}
            </div>
            <div className="flex gap-3">
                <Button onClick={reset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
                <Button
                    onClick={() => (window.location.href = "/dashboard")}
                    variant="outline"
                >
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                </Button>
            </div>
        </motion.div>
    );
}
