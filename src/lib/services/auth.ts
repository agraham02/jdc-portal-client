import { apiClient } from "../api";
import { session } from "../session";
import { User } from "../types/auth";
import {
    LoginFormData,
    EmployeeRegistrationFormData,
    VendorRegistrationFormData,
} from "../validations/auth";

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

const registerEmployee = async (
    data: EmployeeRegistrationFormData
): Promise<{ message: string }> => {
    // Remove confirmPassword before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registrationData } = data;
    return apiClient.post("/auth/register/employee", registrationData);
};

const registerVendor = async (
    data: VendorRegistrationFormData
): Promise<{ message: string }> => {
    // Remove confirmPassword before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registrationData } = data;
    return apiClient.post("/auth/register/vendor", registrationData);
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

const refreshToken = async (): Promise<{ accessToken: string }> => {
    return apiClient.post("/auth/refresh", {});
};

export const AuthService = {
    login,
    registerEmployee,
    registerVendor,
    logout,
    getProfile,
    refreshToken,
};
