"use client";

import { Badge } from "@/components/ui/badge";
import {
    GUIDE_ROLE_COLORS,
    GUIDE_ROLE_LABELS,
    type GuideRole,
} from "@/lib/guides/types";

interface RoleTagProps {
    role: GuideRole;
}

export function RoleTag({ role }: RoleTagProps) {
    return (
        <Badge variant="outline" className={`text-xs ${GUIDE_ROLE_COLORS[role]}`}>
            {GUIDE_ROLE_LABELS[role]}
        </Badge>
    );
}
