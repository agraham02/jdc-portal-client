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
import { AuthService } from "../services/auth";
import { session } from "../session";
import type { Role, User } from "../types/auth";
import { UserStatus } from "../types/auth";

type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: { email: string; password: string }) => Promise<User | null>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    hasRole: (roles: string | string[]) => boolean;
    hasPermission: (perm: string) => boolean;
    isAccountActive: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const refreshingRef = useRef<Promise<void> | null>(null);

    // Load session on mount
    useEffect(() => {
        let cancelled = false;
        async function bootstrap() {
            try {
                const token = session.getAccessToken();
                if (!token) {
                    // Try refresh once on cold start (httpOnly cookie may exist)
                    await safeRefresh();
                }
                const me = await AuthService.getProfile().catch(async (e) => {
                    // If 401, attempt one refresh then retry
                    await safeRefresh();
                    return AuthService.getProfile();
                });
                if (!cancelled) setUser(me);
            } catch {
                // Not signed in
                session.clear();
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        bootstrap();
        return () => {
            cancelled = true;
        };
    }, []);

    const safeRefresh = useCallback(async () => {
        if (refreshingRef.current) return refreshingRef.current;
        const p = (async () => {
            try {
                const { accessToken } = await AuthService.refreshToken();
                session.setAccessToken(accessToken);
            } finally {
                refreshingRef.current = null;
            }
        })();
        refreshingRef.current = p;
        return p;
    }, []);

    const login = useCallback(
        async (data: { email: string; password: string }) => {
            const res = await AuthService.login(data);
            setUser(res.user);
            return res.user ?? null;
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await AuthService.logout();
        } finally {
            session.clear();
            setUser(null);
        }
    }, []);

    const refresh = useCallback(async () => {
        await safeRefresh();
        // Optionally refresh profile if needed
        const me = await AuthService.getProfile();
        setUser(me);
    }, [safeRefresh]);

    const hasRole = useCallback(
        (required: string | string[]) => {
            if (!user) return false;
            const requiredList = Array.isArray(required)
                ? required
                : [required];
            const roleNames = (user.roles as (string | Role)[]).map((r) =>
                typeof r === "string" ? r : r.name
            );
            return requiredList.some((r) => roleNames.includes(r));
        },
        [user]
    );

    const hasPermission = useCallback((_perm: string) => {
        // Placeholder until server exposes /me/permissions consumption on client
        // For now, rely on role gates. Extend later by fetching permissions and caching.
        return true;
    }, []);

    const isAccountActive = useCallback(() => {
        return (
            user?.status === (UserStatus as any).ACTIVE ||
            user?.status === "Active"
        );
    }, [user]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading: loading,
            login,
            logout,
            refresh,
            hasRole,
            hasPermission,
            isAccountActive,
        }),
        [
            user,
            loading,
            login,
            logout,
            refresh,
            hasRole,
            hasPermission,
            isAccountActive,
        ]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
