"use client";

import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { ToastProvider } from "@/components/ui/use-toast";
import { AuthDebugPanel } from "@/components/auth/AuthDebugPanel";

export default function AppLayout({ children }: { children: ReactNode }) {
    const DEBUG_ENABLED =
        process.env.NODE_ENV !== "production" ||
        process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

    return <>{children}</>;
}
