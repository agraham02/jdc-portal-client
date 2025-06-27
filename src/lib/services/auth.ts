import { apiClient } from "../api";
import { User } from "../types/auth";
import { LoginFormData } from "../validations/auth";

const login = (
    credentials: LoginFormData
): Promise<{ token: string; user: User }> => {
    return apiClient.post("/auth/login", credentials);
};

const getProfile = (): Promise<User> => {
    return apiClient.get("/auth/me");
};

export const AuthService = {
    login,
    getProfile,
};
