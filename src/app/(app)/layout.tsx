"use client";

import { ReactNode } from "react";
// import { Navigation } from "@/components/Navigation";
// import { ToastProvider } from "@/components/ui/use-toast";
// import { AuthDebugPanel } from "@/components/auth/AuthDebugPanel";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
    const DEBUG_ENABLED =
        process.env.NODE_ENV !== "production" ||
        process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    );
}
