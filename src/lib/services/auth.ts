import { apiClient } from "../api";
import { session } from "../session";
import { User } from "../types/auth";
import {
    LoginFormData,
    EmployeeRegistrationFormData,
    VendorRegistrationFormData,
} from "../validations/auth";
import type { ProfileUpdateFormData } from "../validations/profile";
import type {
    ForgotPasswordFormData,
    ResetPasswordFormData,
    ChangePasswordFormData,
} from "../validations/auth";
import type {
    LoginDto,
    RegisterEmployeeDto,
    RegisterVendorDto,
    UpdatePasswordDto,
    RequestPasswordResetDto,
    ConfirmPasswordResetDto,
    UpdateProfileDto,
} from "../types/auth";

const login = async (credentials: LoginFormData): Promise<{ user: User }> => {
    const loginDto: LoginDto = {
        email: credentials.email,
        password: credentials.password,
    };

    // The refreshToken is handled by the backend via httpOnly cookies
    const { accessToken } = await apiClient.post<{
        accessToken: string;
        expiresIn: string;
    }>("/auth/login", loginDto);
    session.setAccessToken(accessToken);

    const user = await getProfile();
    return { user };
};

const registerEmployee = async (
    data: EmployeeRegistrationFormData
): Promise<{ message: string }> => {
    // Remove confirmPassword before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...formData } = data;

    // Map to API DTO format
    const registerDto: RegisterEmployeeDto = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        physicalAddress: formData.physicalAddress!,
        mailingAddress: formData.mailingAddress,
        contactPhone: formData.contactPhone,
        employeeId: formData.employeeId,
        jobTitle: formData.jobTitle,
        department: formData.department,
        hireDate: formData.hireDate,
    };

    return apiClient.post<{ message: string }>(
        "/auth/register/employee",
        registerDto
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

const getUserPermissions = (): Promise<{ permissions: string[] }> => {
    return apiClient.get("/auth/me/permissions");
};

const refreshToken = async (): Promise<{
    accessToken: string;
    expiresIn?: string;
}> => {
    // Avoid nested 401 refresh loops when calling /auth/refresh
    return apiClient.post("/auth/refresh", {}, { skipAuthRetry: true });
};

// Get pending accounts (Admin only)
const getPendingAccounts = async (): Promise<{ users: User[] }> => {
    return apiClient.get("/auth/pending");
};

// Approve user account (Admin only)
const approveUser = async (userId: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
        `/auth/${encodeURIComponent(userId)}/approve`,
        {}
    );
};

// Reject user account (Admin only)
const rejectUser = async (
    userId: string,
    reason?: string
): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
        `/auth/${encodeURIComponent(userId)}/reject`,
        { reason }
    );
};

// Request account deletion
const requestAccountDeletion = async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/me/request-delete", {});
};

export const AuthService = {
    login,
    registerEmployee,
    logout,
    getProfile,
    getUserPermissions,
    getPendingAccounts,
    approveUser,
    rejectUser,
    requestAccountDeletion,
    updateProfile(data: Partial<ProfileUpdateFormData>) {
        const updateDto: UpdateProfileDto = {
            firstName: data.firstName,
            lastName: data.lastName,
            contactPhone: data.contactPhone,
        };
        return apiClient.patch<{ message: string }>(
            "/auth/me/profile",
            updateDto
        );
    },
    refreshToken,
    requestPasswordReset(data: ForgotPasswordFormData) {
        const requestDto: RequestPasswordResetDto = {
            email: data.email,
        };
        return apiClient.post<{ message: string; token?: string }>(
            "/auth/password-reset/request",
            requestDto,
            { skipAuthRetry: true }
        );
    },
    confirmPasswordReset(token: string, data: ResetPasswordFormData) {
        const confirmDto: ConfirmPasswordResetDto = {
            token,
            newPassword: data.newPassword,
        };
        return apiClient.post<{ message: string }>(
            "/auth/password-reset/confirm",
            confirmDto,
            { skipAuthRetry: true }
        );
    },
    changePassword(data: ChangePasswordFormData) {
        // remove confirmPassword before sending
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...payload } = data;
        const updateDto: UpdatePasswordDto = {
            currentPassword: payload.oldPassword,
            newPassword: payload.newPassword,
        };
        return apiClient.patch<{ message: string }>(
            "/auth/update-password",
            updateDto
        );
    },
    // Admin user actions
    deactivateUser(userId: string) {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/deactivate`,
            {}
        );
    },
    reactivateUser(userId: string) {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/reactivate`,
            {}
        );
    },
    unlockUser(userId: string) {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/unlock`,
            {}
        );
    },
};
