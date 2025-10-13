import { apiClient } from "../api";
import type { User } from "../types/auth";

export type PendingAccountsResponse = {
    data: User[];
    total: number;
    page: number;
    limit: number;
};

export const ApprovalsService = {
    getPendingAccounts(page = 1, limit = 25) {
        return apiClient.get<PendingAccountsResponse>(
            `/auth/pending?page=${page}&limit=${limit}`
        );
    },
    /**
     * Approve a pending user account
     * Uses standardized /users/:id/approve endpoint
     */
    approveAccount(userId: string) {
        return apiClient.patch<{ message: string }>(
            `/users/${encodeURIComponent(userId)}/approve`,
            {}
        );
    },
    /**
     * Reject a pending user account
     * Uses standardized /users/:id/reject endpoint
     */
    rejectAccount(userId: string, reason?: string) {
        return apiClient.patch<{ message: string }>(
            `/users/${encodeURIComponent(userId)}/reject`,
            reason ? { reason } : {}
        );
    },
};
