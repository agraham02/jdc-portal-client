import { apiClient } from "../api";
import type { User } from "../types/auth";

export type PendingAccountsResponse = {
    data: User[];
    total: number;
    page: number;
    pageSize: number;
};

export const ApprovalsService = {
    getPendingAccounts(page = 1, pageSize = 25) {
        return apiClient.get<PendingAccountsResponse>(
            `/auth/pending?page=${page}&pageSize=${pageSize}`
        );
    },
    approveAccount(userId: string) {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/approve`,
            {}
        );
    },
    rejectAccount(userId: string, reason?: string) {
        return apiClient.patch<{ message: string }>(
            `/auth/${encodeURIComponent(userId)}/reject`,
            reason ? { reason } : {}
        );
    },
};
