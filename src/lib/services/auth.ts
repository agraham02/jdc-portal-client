import { apiClient } from "../api";
import { session } from "../session";
import { User } from "../types/auth";
import {
    LoginFormData,
    EmployeeRegistrationFormData,
} from "../validations/auth";
import type {
    ForgotPasswordFormData,
    ResetPasswordFormData,
    ChangePasswordFormData,
} from "../validations/auth";
import type {
    LoginDto,
    UpdatePasswordDto,
    RequestPasswordResetDto,
    ConfirmPasswordResetDto,
    UpdateProfileDto,
} from "../types/auth";

export const AuthService = {
    async login(credentials: LoginFormData): Promise<{ user: User }> {
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

        const user = await AuthService.getProfile();
        return { user };
    },
    async registerEmployee(
        data: EmployeeRegistrationFormData,
    ): Promise<{ message: string }> {
        // Remove confirmPassword before sending to backend
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...registrationData } = data;

        return apiClient.post<{ message: string }>(
            "/auth/register/employee",
            registrationData,
        );
    },
    logout() {
        return apiClient.post<{ message: string }>("/auth/logout", {});
    },
    getProfile: (): Promise<User> => {
        return apiClient.get("/auth/me");
    },
    getUserPermissions: (): Promise<{ permissions: string[] }> => {
        return apiClient.get("/auth/me/permissions");
    },
    /**
     * Get computed account type from user's roles
     * Priority: Admin > Vendor > Employee > Housing_Tenant
     */
    getAccountType: (): Promise<{
        accountType: "Admin" | "Vendor" | "Employee" | "Housing_Tenant" | null;
    }> => {
        return apiClient.get("/auth/account-type");
    },
    getPendingAccounts() {
        return apiClient.get<{ users: User[] }>("/auth/pending");
    },
    approveUser(userId: string): Promise<{ message: string }> {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/approve`,
            {},
        );
    },
    rejectUser(userId: string, reason?: string): Promise<{ message: string }> {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/reject`,
            { reason },
        );
    },
    requestAccountDeletion(body?: {
        confirmationPhrase?: string;
        password?: string;
    }): Promise<{
        message: string;
        status?: "scheduled" | "pending_approval";
        scheduledFor?: string;
        graceDays?: number;
    }> {
        return apiClient.delete<{
            message: string;
            status?: "scheduled" | "pending_approval";
            scheduledFor?: string;
            graceDays?: number;
        }>("/auth/me", {}, body);
    },
    approveDeletion(userId: string) {
        return apiClient.post<{
            message: string;
            status: string;
            scheduledFor: string;
            graceDays: number;
            orphanedReports: number;
        }>(`/users/${encodeURIComponent(userId)}/deletion-request/approve`, {});
    },
    cancelDeletion(userId: string) {
        return apiClient.post<{ message: string; status: string }>(
            `/users/${encodeURIComponent(userId)}/deletion-request/cancel`,
            {},
        );
    },
    listPendingDeletions(page = 1, limit = 25) {
        return apiClient.get<{
            data: Array<{
                _id: string;
                email: string;
                firstName?: string;
                lastName?: string;
                status: string;
                deleteRequested?: boolean;
                deleteRequestedAt?: string;
                roles?: Array<{ name?: string }>;
            }>;
            total: number;
            page: number;
            limit: number;
        }>(`/users/deletion-requests?page=${page}&limit=${limit}`);
    },
    updateProfile(data: Partial<UpdateProfileDto>) {
        return apiClient.patch<{ message: string }>("/auth/me", data);
    },
    refreshToken() {
        return apiClient.post<{
            accessToken: string;
            expiresIn: string;
        }>("/auth/refresh", {}, { skipAuthRetry: true });
    },
    requestPasswordReset(data: ForgotPasswordFormData) {
        const requestDto: RequestPasswordResetDto = {
            email: data.email,
        };
        return apiClient.post<{ message: string; token?: string }>(
            "/auth/password-reset/request",
            requestDto,
            { skipAuthRetry: true },
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
            { skipAuthRetry: true },
        );
    },
    changePassword(data: ChangePasswordFormData) {
        // remove confirmPassword before sending
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...payload } = data;
        const updateDto: UpdatePasswordDto = {
            oldPassword: payload.oldPassword,
            newPassword: payload.newPassword,
        };
        return apiClient.patch<{ message: string }>(
            "/auth/update-password",
            updateDto,
        );
    },
    // Admin user actions
    deactivateUser(userId: string) {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/deactivate`,
            {},
        );
    },
    reactivateUser(userId: string) {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/reactivate`,
            {},
        );
    },
    unlockUser(userId: string) {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/unlock`,
            {},
        );
    },
    // Email verification
    verifyEmail(token: string) {
        return apiClient.post<{ message: string }>(
            "/auth/verify-email",
            { token },
            { skipAuthRetry: true },
        );
    },
    resendVerification(email: string) {
        return apiClient.post<{ message: string }>(
            "/auth/resend-verification",
            { email },
            { skipAuthRetry: true },
        );
    },
    // Account activation
    validateActivationToken(token: string) {
        return apiClient.get<{
            valid: boolean;
            email?: string;
            firstName?: string;
            lastName?: string;
        }>(
            `/auth/validate-activation-token?token=${encodeURIComponent(
                token,
            )}`,
            { skipAuthRetry: true },
        );
    },
    resendActivation(userId: string) {
        return apiClient.post<{ message: string }>(
            `/auth/resend-activation/${encodeURIComponent(userId)}`,
            {},
        );
    },
};
