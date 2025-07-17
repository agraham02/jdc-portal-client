"use client";

import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { ToastProvider } from "@/components/ui/use-toast";

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
                    </div>
                </ToastProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}
