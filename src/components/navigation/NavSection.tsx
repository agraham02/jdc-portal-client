"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
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
import { useAuthz } from "@/lib/authz/useAuthz";

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
    const { hasAny, hasAll } = useAuthz();

    // Check if there are any visible items based on RBAC
    const hasVisibleItems = useMemo(() => {
        if (items.length === 0) return false;

        // Check if at least one item is visible
        return items.some((item) => {
            // Items without permission requirements are always visible
            if (!item.anyOf && !item.allOf) return true;

            // Check anyOf permissions
            if (item.anyOf && hasAny(item.anyOf)) return true;

            // Check allOf permissions
            if (item.allOf && hasAll(item.allOf)) return true;

            return false;
        });
    }, [items, hasAny, hasAll]);

    // Hide the entire section if there are no visible items
    if (!hasVisibleItems) return null;

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
