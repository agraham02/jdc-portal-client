"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { pageTransition } from "@/lib/animations";

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to external service in production
        console.error("[Root Error]", error);

        // TODO: Send to Sentry or other error tracking service
        // if (process.env.NODE_ENV === 'production') {
        //     captureException(error);
        // }
    }, [error]);

    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            className="flex min-h-screen flex-col items-center justify-center gap-6 px-4"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-destructive/10 p-3">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold">Something went wrong</h1>
                <p className="max-w-md text-muted-foreground">
                    {error.message ||
                        "An unexpected error occurred. Please try again."}
                </p>
                {error.digest && (
                    <p className="text-sm text-muted-foreground">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
            <div className="flex gap-3">
                <Button onClick={reset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
                <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                >
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                </Button>
            </div>
        </motion.div>
    );
}
