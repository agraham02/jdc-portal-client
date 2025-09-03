"use client";

import React from "react";
import { useAuthz } from "@/lib/authz/useAuthz";

type CanProps = {
    anyOf?: string[];
    allOf?: string[];
    not?: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
};

export function Can({
    anyOf,
    allOf,
    not,
    children,
    fallback = null,
}: CanProps) {
    const { hasAny, hasAll } = useAuthz();

    // Positive checks
    const okAny = anyOf ? hasAny(anyOf) : true;
    const okAll = allOf ? hasAll(allOf) : true;

    // Negative checks
    const okNot = not ? !hasAny(not) : true;

    const allowed = okAny && okAll && okNot;
    if (!allowed) return <>{fallback}</>;
    return <>{children}</>;
}
