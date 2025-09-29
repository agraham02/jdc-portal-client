import { UserStatus } from "@/lib/types/auth";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default function StatusChip({ status }: { status: UserStatus }) {
    type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

    const variants: Record<
        UserStatus,
        { label: string; variant: BadgeVariant }
    > = {
        [UserStatus.PENDING]: { label: "Pending", variant: "secondary" },
        [UserStatus.ACTIVE]: { label: "Active", variant: "default" },
        [UserStatus.INACTIVE]: { label: "Inactive", variant: "outline" },
        [UserStatus.ONBOARDING]: { label: "Onboarding", variant: "secondary" },
        [UserStatus.REJECTED]: { label: "Rejected", variant: "destructive" },
        [UserStatus.TERMINATED]: {
            label: "Terminated",
            variant: "destructive",
        },
        [UserStatus.ARCHIVED]: { label: "Archived", variant: "outline" },
    };
    return (
        <Badge variant={variants[status].variant}>
            {variants[status].label}
        </Badge>
    );
}
