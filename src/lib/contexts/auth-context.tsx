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
import {
    User,
    UserStatus,
    AccountType,
    RoleName,
    Vendor,
    Employee,
    LoginCredentials,
} from "@/lib/types/auth";

// Re-export for backward compatibility
export { UserStatus, AccountType, RoleName };

export interface AuthUser extends User {
    vendor?: Vendor;
    employee?: Employee;
    permissions?: string[];
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    hasRole: (role: RoleName | RoleName[]) => boolean;
    hasAccountType: (type: AccountType | AccountType[]) => boolean;
    hasPermission: (permission: string) => boolean;
    isAccountActive: () => boolean;
    getRoleNames: () => RoleName[];
    getDisplayName: () => string;
    isAdmin: () => boolean;
    isEmployee: () => boolean;
    isVendor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Check if user has specific role(s)
    const hasRole = (requiredRoles: RoleName | RoleName[]): boolean => {
        if (!user || !user.roles) return false;
        const roleNames = Array.isArray(requiredRoles)
            ? requiredRoles
            : [requiredRoles];

        // Handle both populated Role objects and string IDs
        const userRoleNames = user.roles.map((role) =>
            typeof role === "string" ? role : role.name
        );

        return roleNames.some((roleName) => userRoleNames.includes(roleName));
    };

    // Check if user has specific account type(s)
    const hasAccountType = (
        requiredTypes: AccountType | AccountType[]
    ): boolean => {
        if (!user) return false;
        const types = Array.isArray(requiredTypes)
            ? requiredTypes
            : [requiredTypes];
        return types.includes(user.accountType);
    };

    // Check if user has specific permission
    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        return user.permissions?.includes(permission) || false;
    };

    // Check if account is active and accessible
    const isAccountActive = (): boolean => {
        if (!user) return false;
        return user.status === UserStatus.ACTIVE;
    };

    // Get all role names for the user
    const getRoleNames = (): RoleName[] => {
        if (!user || !user.roles) return [];
        return user.roles.map((role) =>
            typeof role === "string" ? (role as RoleName) : role.name
        );
    };

    // Get display name (full name or email)
    const getDisplayName = (): string => {
        if (!user) return "";
        return user.fullName || user.email;
    };

    // Utility functions for common role checks
    const isAdmin = (): boolean => hasRole(RoleName.ADMIN);
    const isEmployee = (): boolean => hasRole(RoleName.EMPLOYEE);
    const isVendor = (): boolean => hasRole(RoleName.VENDOR);

    const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
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
            console.error("Failed to refresh user:", error);
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
                console.error("Failed to initialize auth:", error);
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
                hasAccountType,
                hasPermission,
                isAccountActive,
                getRoleNames,
                getDisplayName,
                isAdmin,
                isEmployee,
                isVendor,
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
