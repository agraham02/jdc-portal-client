"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { AuthService } from "@/lib/services";
import { session } from "@/lib/session";
import { User } from "@/lib/types/auth";

export enum UserRole {
    ADMIN = "admin",
    EMPLOYEE = "employee",
    VENDOR = "vendor",
}

export enum AccountStatus {
    ACTIVE = "active",
    PENDING = "pending",
    SUSPENDED = "suspended",
    INACTIVE = "inactive",
}

export interface AuthUser extends User {
    role: UserRole;
    status: AccountStatus;
    permissions?: string[];
    isEmailVerified?: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    hasRole: (role: UserRole | UserRole[]) => boolean;
    hasPermission: (permission: string) => boolean;
    isAccountActive: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Check if user has specific role(s)
    const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
        if (!user) return false;
        const roles = Array.isArray(requiredRoles)
            ? requiredRoles
            : [requiredRoles];
        return roles.includes(user.role);
    };

    // Check if user has specific permission
    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        return user.permissions?.includes(permission) || false;
    };

    // Check if account is active and verified
    const isAccountActive = (): boolean => {
        if (!user) return false;
        return (
            user.status === AccountStatus.ACTIVE &&
            (user.isEmailVerified ?? false)
        );
    };

    const login = async (credentials: any): Promise<AuthUser> => {
        setIsLoading(true);
        try {
            const { user: authenticatedUser } = await AuthService.login(
                credentials
            );
            setUser(authenticatedUser as AuthUser);
            return authenticatedUser as AuthUser;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await AuthService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const user = await AuthService.getProfile();
            setUser(user as AuthUser);
        } catch (error) {
            setUser(null);
        }
    };

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Check if we have an access token first
                const token = session.getAccessToken();
                if (!token) {
                    // No token means definitely not authenticated
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                // Only try to get profile if we have a token
                const user = await AuthService.getProfile();
                setUser(user as AuthUser);
            } catch (error) {
                // If profile fetch fails, clear user state
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                logout,
                refreshUser,
                hasRole,
                hasPermission,
                isAccountActive,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
