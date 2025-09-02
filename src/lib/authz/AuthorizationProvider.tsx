"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { apiClient } from "../api";
import { session } from "../session";

type AuthorizationContextValue = {
    permissions: Set<string>;
    loading: boolean;
    hasAny: (perms: string | string[]) => boolean;
    hasAll: (perms: string | string[]) => boolean;
    refresh: () => Promise<void>;
};

const AuthorizationContext = createContext<
    AuthorizationContextValue | undefined
>(undefined);

export function AuthorizationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [permissions, setPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const refreshRef = useRef<Promise<void> | null>(null);

    const fetchPermissions = useCallback(async () => {
        try {
            // Prefer dedicated endpoint if available
            const resp = await apiClient.get<{ permissions: string[] }>(
                "/auth/me/permissions"
            );
            setPermissions(new Set(resp.permissions || []));
        } catch (e) {
            // Fallback: some backends might embed effectivePermissions in /auth/me
            try {
                const me = await apiClient.get<{
                    effectivePermissions?: string[];
                }>("/auth/me");
                setPermissions(new Set(me.effectivePermissions || []));
            } catch {
                setPermissions(new Set());
            }
        }
    }, []);

    // Bootstrap on mount and whenever token changes
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                await fetchPermissions();
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [fetchPermissions]);

    const refresh = useCallback(async () => {
        if (refreshRef.current) return refreshRef.current;
        refreshRef.current = (async () => {
            try {
                await fetchPermissions();
            } finally {
                refreshRef.current = null;
            }
        })();
        return refreshRef.current;
    }, [fetchPermissions]);

    const hasAny = useCallback(
        (req: string | string[]) => {
            if (!permissions || permissions.size === 0) return false;
            const list = Array.isArray(req) ? req : [req];
            return list.some((p) => permissions.has(p));
        },
        [permissions]
    );

    const hasAll = useCallback(
        (req: string | string[]) => {
            if (!permissions || permissions.size === 0) return false;
            const list = Array.isArray(req) ? req : [req];
            return list.every((p) => permissions.has(p));
        },
        [permissions]
    );

    const value = useMemo<AuthorizationContextValue>(
        () => ({ permissions, loading, hasAny, hasAll, refresh }),
        [permissions, loading, hasAny, hasAll, refresh]
    );

    return (
        <AuthorizationContext.Provider value={value}>
            {children}
        </AuthorizationContext.Provider>
    );
}

export function useAuthorization() {
    const ctx = useContext(AuthorizationContext);
    if (!ctx)
        throw new Error(
            "useAuthorization must be used within AuthorizationProvider"
        );
    return ctx;
}
