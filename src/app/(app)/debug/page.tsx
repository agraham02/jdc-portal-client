"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthDebugPage() {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push("/admin/control-panel/debug");
        }, 5000);
        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <AlertTriangle className="h-16 w-16 text-yellow-600" />
                </div>

                <h1 className="text-3xl font-bold">Debug Console Has Moved</h1>

                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    The authentication debug console is now part of the Admin
                    Control Panel.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-left">
                    <h2 className="font-semibold mb-2">New Location:</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Admin Control Panel → Debug Console
                    </p>
                    <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm">
                        /admin/control-panel/debug
                    </code>
                </div>

                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={() =>
                            router.push("/admin/control-panel/debug")
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Go to Debug Console
                    </Button>

                    <Button
                        onClick={() => router.push("/admin/control-panel")}
                        variant="outline"
                    >
                        Go to Control Panel
                    </Button>
                </div>

                <p className="text-sm text-gray-500">
                    Redirecting automatically in 5 seconds...
                </p>
            </div>
        </div>
    );
}
