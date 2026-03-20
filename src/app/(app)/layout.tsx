"use client";

import { ReactNode } from "react";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/contexts/auth-context";
import { NovuInbox } from "@/components/notifications/NovuInbox";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { TourProvider } from "@/lib/tours/tour-provider";
import { HelpFAB } from "@/components/help/HelpFAB";

export default function AppLayout({ children }: { children: ReactNode }) {
    const { logout } = useAuth();

    return (
        <TourProvider>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-14 items-center gap-2 px-4">
                        <SidebarTrigger data-tour="sidebar-trigger" />
                        <div className="flex items-center gap-2" data-tour="header-logo">
                            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-semibold">JDC Portal</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <div data-tour="notifications"><NovuInbox /></div>
                            <div data-tour="theme-toggle"><ThemeToggle /></div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => logout()}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>
                <ProtectedRoute>
                    <div className="p-4">{children}</div>
                </ProtectedRoute>
            </SidebarInset>
        </SidebarProvider>
        <HelpFAB />
        </TourProvider>
    );
}
