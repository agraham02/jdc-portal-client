"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { MenuItem } from "./types";
import { Can } from "@/components/auth/Can";

function isActive(pathname: string, url: string) {
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(url + "/");
}

export function NavSection({
    label,
    items,
}: {
    label: string;
    items: MenuItem[];
}) {
    const pathname = usePathname();

    // Memoize visible items based on RBAC props
    const visibleItems = items.filter(
        (item) => !item.anyOf && !item.allOf
    );

    // Hide the entire section if there are no visible items
    if (visibleItems.length === 0) return null;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const content = (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive(pathname, item.url)}
                                >
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                        if (item.anyOf || item.allOf) {
                            return (
                                <Can
                                    key={item.title}
                                    anyOf={item.anyOf}
                                    allOf={item.allOf}
                                >
                                    {content}
                                </Can>
                            );
                        }
                        return content;
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
