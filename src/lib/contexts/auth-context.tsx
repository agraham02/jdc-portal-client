"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
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
    refreshToken: () => Promise<boolean>; // Add explicit refresh method
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
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

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

    const refreshToken = async (): Promise<boolean> => {
        try {
            const { accessToken } = await AuthService.refreshToken();
            session.setAccessToken(accessToken);

            // Optionally refresh user data after token refresh
            try {
                await refreshUser();
            } catch (error) {
                // Don't fail the token refresh if user refresh fails
                console.warn("User refresh failed after token refresh:", error);
            }

            return true;
        } catch (error) {
            console.error("Token refresh failed:", error);
            // Clear session if refresh fails
            session.destroy();
            setUser(null);
            setIsInitialized(true); // Mark as initialized even on failure

            // Redirect to login if refresh fails (user session expired)
            router.push("/login");

            return false;
        }
    };

    const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
        setIsLoading(true);
        try {
            const { user: authenticatedUser } = await AuthService.login(
                credentials
            );
            setUser(authenticatedUser as AuthUser);
            setIsInitialized(true); // Mark as initialized after successful login
            return authenticatedUser as AuthUser;
        } catch (error) {
            console.error("Login failed:", error);
            setUser(null);
            throw error; // Re-throw to allow login component to handle error
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            // Clear user state immediately for responsive UI
            setUser(null);
            setIsInitialized(false); // Reset initialization flag

            // Attempt to notify backend to revoke refresh token
            await AuthService.logout();
        } catch (error) {
            console.error("Logout API call failed:", error);
            // Don't throw error - logout should always succeed on frontend
        } finally {
            // Ensure session is always cleared
            session.destroy();
            setIsLoading(false);
            router.push("/login");
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
        // Skip initialization if already initialized (after login)
        if (isInitialized) {
            return;
        }

        const initializeAuth = async () => {
            try {
                const token = session.getAccessToken();

                if (!token) {
                    // No access token in memory - try to refresh using httpOnly cookie
                    try {
                        const refreshResult = await AuthService.refreshToken();
                        session.setAccessToken(refreshResult.accessToken);

                        // Get the user profile with the new token
                        const user = await AuthService.getProfile();
                        setUser(user as AuthUser);
                        setIsInitialized(true);
                        return;
                    } catch {
                        setUser(null);
                        setIsInitialized(true);
                        return;
                    }
                }

                // We have an access token in memory - try to get profile
                // The API client will automatically handle token refresh if needed
                try {
                    const user = await AuthService.getProfile();
                    setUser(user as AuthUser);
                    setIsInitialized(true);
                } catch (profileError) {
                    // Profile fetch failed - token may be invalid/expired
                    console.error("Failed to get user profile:", profileError);
                    setUser(null);
                    setIsInitialized(true);
                }
            } catch (authError) {
                console.error("Failed to initialize auth:", authError);
                setUser(null);
                setIsInitialized(true);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [isInitialized]); // Add isInitialized as dependency

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                logout,
                refreshUser,
                refreshToken,
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
