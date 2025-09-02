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

export function AppSidebar() {
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
            </SidebarFooter>
        </Sidebar>
    );
}
