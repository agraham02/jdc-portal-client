"use client";

import { BaseDashboardCard } from "../BaseDashboardCard";
import { Button } from "@/components/ui/button";
import { FileText, Users, Briefcase, User } from "lucide-react";
import Link from "next/link";

/**
 * QuickLinksCard provides fast access to common employee actions
 */
export function QuickLinksCard() {
    const links = [
        {
            href: "/contracts",
            label: "View Contracts",
            icon: FileText,
            description: "Browse available contracts",
        },
        {
            href: "/employees",
            label: "Employee Directory",
            icon: Users,
            description: "View employee information",
        },
        {
            href: "/vendors",
            label: "Vendor Directory",
            icon: Briefcase,
            description: "View vendor information",
        },
        {
            href: "/profile",
            label: "My Profile",
            icon: User,
            description: "Update your profile",
        },
    ];

    return (
        <BaseDashboardCard title="Quick Links">
            <div className="grid gap-3">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Button
                            key={link.href}
                            variant="outline"
                            className="h-auto justify-start p-4"
                            asChild
                        >
                            <Link href={link.href}>
                                <div className="flex items-start gap-3">
                                    <Icon className="h-5 w-5 mt-0.5 text-primary" />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">
                                            {link.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {link.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </BaseDashboardCard>
    );
}
