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
import type { AccountType, Role, User } from "../types/auth";
import { useAuthz } from "@/lib/authz/useAuthz";
import { UserStatusHelper } from "@/lib/utils/user-status-helper";

type AuthContextValue = {
    user: User | null;
    accountType: AccountType | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: { email: string; password: string }) => Promise<User | null>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    hasRole: (roles: string | string[]) => boolean;
    hasPermission: (perm: string) => boolean;
    isAccountActive: () => boolean;
    isAccountPending: () => boolean;
    isAccountRejected: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accountType, setAccountType] = useState<AccountType | null>(null);
    const [loading, setLoading] = useState(true);
    const refreshingRef = useRef<Promise<void> | null>(null);
    const { refresh: refreshPermissions, hasAny } = useAuthz();

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

    const fetchAccountType = useCallback(async () => {
        try {
            const { accountType: type } = await AuthService.getAccountType();
            setAccountType(type as AccountType | null);
        } catch {
            setAccountType(null);
        }
    }, []);

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
                const me = await AuthService.getProfile().catch(async () => {
                    // If 401, attempt one refresh then retry
                    await safeRefresh();
                    return AuthService.getProfile();
                });
                if (!cancelled) {
                    setUser(me);
                    // Fetch account type after user is loaded
                    await fetchAccountType();
                }
                // Refresh permissions in parallel
                refreshPermissions().catch(() => {});
            } catch {
                // Not signed in
                session.clear();
                if (!cancelled) {
                    setUser(null);
                    setAccountType(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        bootstrap();
        return () => {
            cancelled = true;
        };
    }, [refreshPermissions, safeRefresh, fetchAccountType]);

    const login = useCallback(
        async (data: { email: string; password: string }) => {
            const res = await AuthService.login(data);
            setUser(res.user);
            // Fetch account type after login
            await fetchAccountType();
            // Ensure permissions are up to date post-login
            refreshPermissions().catch(() => {});
            return res.user ?? null;
        },
        [refreshPermissions, fetchAccountType]
    );

    const logout = useCallback(async () => {
        try {
            await AuthService.logout();
        } finally {
            session.clear();
            setUser(null);
            setAccountType(null);
        }
    }, []);

    const refresh = useCallback(async () => {
        await safeRefresh();
        // Optionally refresh profile if needed
        const me = await AuthService.getProfile();
        setUser(me);
        // Fetch account type
        await fetchAccountType();
        // Also refresh permissions
        await refreshPermissions();
    }, [safeRefresh, refreshPermissions, fetchAccountType]);

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

    const hasPermission = useCallback(
        (perm: string) => {
            return hasAny(perm);
        },
        [hasAny]
    );

    const isAccountActive = useCallback(() => {
        if (!user) return false;
        return UserStatusHelper.isActive(user.status);
    }, [user]);

    const isAccountPending = useCallback(() => {
        if (!user) return false;
        return UserStatusHelper.isPending(user.status);
    }, [user]);

    const isAccountRejected = useCallback(() => {
        if (!user) return false;
        return UserStatusHelper.isRejected(user.status);
    }, [user]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            accountType,
            isAuthenticated: !!user,
            isLoading: loading,
            login,
            logout,
            refresh,
            hasRole,
            hasPermission,
            isAccountActive,
            isAccountPending,
            isAccountRejected,
        }),
        [
            user,
            accountType,
            loading,
            login,
            logout,
            refresh,
            hasRole,
            hasPermission,
            isAccountActive,
            isAccountPending,
            isAccountRejected,
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
