"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileX, Home } from "lucide-react";

export default function ContractsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Contracts Error]", error);
    }, [error]);

    return (
        <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 px-4">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-destructive/10 p-3">
                    <FileX className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-semibold">
                    Failed to Load Contracts
                </h2>
                <p className="max-w-md text-muted-foreground">
                    {error.message ||
                        "An error occurred while loading contract data."}
                </p>
            </div>
            <div className="flex gap-3">
                <Button onClick={reset} variant="default">
                    <AlertTriangle className="mr-2 h-4 w-4" />
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
        </div>
    );
}
