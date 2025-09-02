"use client";

import { ReactNode } from "react";
// import { Navigation } from "@/components/Navigation";
// import { ToastProvider } from "@/components/ui/use-toast";
// import { AuthDebugPanel } from "@/components/auth/AuthDebugPanel";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";

export default function AppLayout({ children }: { children: ReactNode }) {
    const DEBUG_ENABLED =
        process.env.NODE_ENV !== "production" ||
        process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-14 items-center gap-2 px-4">
                        <SidebarTrigger />
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-semibold">JDC Portal</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/notifications">Notifications</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/profile">Profile</Link>
                            </Button>
                        </div>
                    </div>
                </header>
                <ProtectedRoute>
                    <div className="p-4">{children}</div>
                </ProtectedRoute>
            </SidebarInset>
        </SidebarProvider>
    );
}
