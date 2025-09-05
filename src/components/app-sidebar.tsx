"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavSection } from "@/components/navigation/NavSection";
import { menu } from "@/components/navigation/menu-config";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import Link from "next/link";

export function AppSidebar() {
    const DEBUG_ENABLED =
        process.env.NODE_ENV !== "production" ||
        process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <NavSection label="Application" items={menu.application} />

                <SidebarSeparator />

                <NavSection label="Procurement" items={menu.procurement} />
                <NavSection label="People" items={menu.people} />
                <NavSection label="Admin" items={menu.admin} />

                <SidebarSeparator />

                <NavSection label="Account" items={menu.account} />
            </SidebarContent>
            <SidebarFooter>
                <ThemeToggle />
                {DEBUG_ENABLED && (
                    <div className="mt-2 text-xs">
                        <Link
                            href="/debug"
                            className="text-blue-600 hover:underline"
                        >
                            Debug
                        </Link>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
