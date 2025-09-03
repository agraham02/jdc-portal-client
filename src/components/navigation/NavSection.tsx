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
import { Can } from "@/components/authz/Can";

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
