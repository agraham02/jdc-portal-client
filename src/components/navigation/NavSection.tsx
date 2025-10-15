"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
    const [hasChecked, setHasChecked] = useState(false);
    const [visibleCount, setVisibleCount] = useState(-1);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (menuRef.current) {
            const visibleItems = menuRef.current.querySelectorAll("li");
            setVisibleCount(visibleItems.length);
            setHasChecked(true);
        }
    }, [items]);

    // Hide the entire section if we've checked and found no visible items
    if (hasChecked && visibleCount === 0) return null;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu ref={menuRef as any}>
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
