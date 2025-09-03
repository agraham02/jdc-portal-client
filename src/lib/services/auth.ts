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
    return apiClient.post<{ message: string }>(
        "/auth/register/employee",
        registrationData
    );
};

const registerVendor = async (
    data: VendorRegistrationFormData
): Promise<{ message: string }> => {
    // Remove confirmPassword before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registrationData } = data;
    return apiClient.post<{ message: string }>(
        "/auth/register/vendor",
        registrationData
    );
};

const logout = async (): Promise<{ message: string }> => {
    // Tell the backend to invalidate the refresh token
    // Don't clear session here - let AuthContext handle it
    const response = await apiClient.post<{ message: string }>(
        "/auth/logout",
        {}
    );
    return response;
};

const getProfile = (): Promise<User> => {
    return apiClient.get("/auth/me");
};

const refreshToken = async (): Promise<{
    accessToken: string;
    expiresIn?: string;
}> => {
    // Avoid nested 401 refresh loops when calling /auth/refresh
    return apiClient.post("/auth/refresh", {}, { skipAuthRetry: true });
};

// Email verification: The backend currently has no explicit endpoints in the auth controller.
// We provide thin wrappers that can be wired once available. For now, they will attempt
// conventional endpoints and throw a clear error if not present.
const verifyEmail = async (token: string): Promise<{ message: string }> => {
    // Try a conventional path; backend may add this later.
    return apiClient.post<{ message: string }>(
        "/auth/verify-email",
        { token },
        { skipAuthRetry: true }
    );
};

const resendVerification = async (
    email: string
): Promise<{ message: string; nextAllowedAt?: string }> => {
    // Rate-limited on server; 429 returns retry-after we surface via apiClient details
    return apiClient.post<{ message: string; nextAllowedAt?: string }>(
        "/auth/verify-email/resend",
        { email },
        { skipAuthRetry: true }
    );
};

export const AuthService = {
    login,
    registerEmployee,
    registerVendor,
    logout,
    getProfile,
    refreshToken,
    verifyEmail,
    resendVerification,
};
