"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { RoleName } from "@/lib/types/auth";

interface RoleGuardProps {
    children: ReactNode;
    requiredRoles: RoleName | RoleName[];
    fallback?: ReactNode;
}

export function RoleGuard({
    children,
    requiredRoles,
    fallback = null,
}: RoleGuardProps) {
    const { hasRole } = useAuth();

    if (!hasRole(requiredRoles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
