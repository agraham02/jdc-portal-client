"use client";

import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { ToastProvider } from "@/components/ui/use-toast";
import { AuthDebugPanel } from "@/components/auth/AuthDebugPanel";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <ToastProvider>
                    <div className="flex min-h-screen bg-background">
                        <Navigation />
                        <main className="flex-1 p-6 overflow-auto">
                            {children}
                        </main>
                        {/* Debug panel - only shows in development or when debug is enabled */}
                        <div className="fixed bottom-4 right-4 z-50">
                            <AuthDebugPanel />
                        </div>
                    </div>
                </ToastProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}
