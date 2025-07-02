"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { AccountType } from "@/lib/types/auth";

interface AccountTypeGuardProps {
    children: ReactNode;
    requiredAccountTypes: AccountType | AccountType[];
    fallback?: ReactNode;
}

export function AccountTypeGuard({
    children,
    requiredAccountTypes,
    fallback = null,
}: AccountTypeGuardProps) {
    const { hasAccountType } = useAuth();

    if (!hasAccountType(requiredAccountTypes)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
