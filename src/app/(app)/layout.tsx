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
                    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-14 items-center gap-2 px-4">
                            <SidebarTrigger data-tour="sidebar-trigger" />
                            <div
                                className="flex items-center gap-2"
                                data-tour="header-logo"
                            >
                                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                                    <Building2 className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <span className="font-semibold tracking-tight">
                                    JDC Portal
                                </span>
                            </div>
                            <div className="ml-auto flex items-center gap-1">
                                <div data-tour="notifications">
                                    <NovuInbox />
                                </div>
                                <div data-tour="theme-toggle">
                                    <ThemeToggle />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => logout()}
                                    className="text-muted-foreground hover:text-destructive"
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
