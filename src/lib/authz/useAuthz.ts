"use client";

import { useAuthorization } from "./AuthorizationProvider";

export function useAuthz() {
    const { hasAny, hasAll, permissions, loading, refresh } =
        useAuthorization();
    return {
        hasAny,
        hasAll,
        permissions,
        loading,
        refresh,
    } as const;
}
