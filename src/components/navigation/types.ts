import type { LucideIcon } from "lucide-react";

export type MenuItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    // Optional permission requirement(s) for visibility
    anyOf?: string[];
    allOf?: string[];
};
