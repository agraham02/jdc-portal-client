import { apiClient } from "../api";
import { LoginCredentials, User } from "../types/auth";

const login = (
    credentials: LoginCredentials
): Promise<{ token: string; user: User }> => {
    return apiClient.post("/auth/login", credentials);
};

const getProfile = (): Promise<User> => {
    return apiClient.get("/auth/me");
};

export const authService = {
    login,
    getProfile,
};
