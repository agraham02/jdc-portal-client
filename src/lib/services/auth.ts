import { apiClient } from "../api";
import { session } from "../session";
import { User } from "../types/auth";
import { LoginFormData } from "../validations/auth";

const login = async (credentials: LoginFormData): Promise<{ user: User }> => {
    // The refreshToken is handled by the backend via httpOnly cookies
    const { accessToken } = await apiClient.post<{
        accessToken: string;
        expiresIn: string;
    }>("/auth/login", credentials);
    session.setAccessToken(accessToken);

    const user = await getProfile();

    return { user };
};

const logout = async () => {
    try {
        // Tell the backend to invalidate the refresh token
        await apiClient.post("/auth/logout", {});
    } catch (error) {
        console.error("Logout failed", error);
    } finally {
        // Always clear the client-side session
        session.destroy();
    }
};

const getProfile = (): Promise<User> => {
    return apiClient.get("/auth/me");
};

export const AuthService = {
    login,
    logout,
    getProfile,
};
