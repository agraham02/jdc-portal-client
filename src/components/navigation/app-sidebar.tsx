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

// TODO: make sure title is not show if nav section is empty (it is currently being shown)
export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <NavSection label="Application" items={menu.application} />

                <SidebarSeparator />

                <NavSection label="People" items={menu.people} />
                <NavSection label="Procurement" items={menu.procurement} />
                <NavSection label="HR" items={menu.resources} />
                <NavSection
                    label="User Management"
                    items={menu.userManagement}
                />

                <SidebarSeparator />

                <NavSection
                    label="Admin Control Panel"
                    items={menu.adminControlPanel}
                />
            </SidebarContent>
            <SidebarFooter>
                <NavSection label="Account" items={menu.account} />
            </SidebarFooter>
        </Sidebar>
    );
}
