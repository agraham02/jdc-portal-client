"use client";

import { ReactNode } from "react";
import { useAuth, UserRole } from "@/lib/contexts/auth-context";

interface RoleGuardProps {
    children: ReactNode;
    requiredRoles: UserRole | UserRole[];
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
