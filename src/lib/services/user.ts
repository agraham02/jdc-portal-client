import { apiClient } from "@/lib/api";
import type { User, UserDetailsResponse } from "@/lib/types/auth";

export interface UserListResponse {
    data: User[];
    total?: number;
}

export interface UserQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    accountType?: string;
    search?: string;
}

class UserService {
    /**
     * Get all users with pagination and filtering (admin only)
     */
    async getUsers(params: UserQueryParams = {}): Promise<UserListResponse> {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const endpoint = `/admin/users${queryString ? `?${queryString}` : ""}`;

        return apiClient.get<UserListResponse>(endpoint);
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<User> {
        return apiClient.get<User>(`/users/${userId}`);
    }

    /**
     * Update user by ID (admin)
     */
    async updateUser(userId: string, data: Partial<User>): Promise<User> {
        return apiClient.patch<User>(`/admin/users/${userId}`, data);
    }

    /**
     * Search users by name or email
     */
    async searchUsers(query: string, limit: number = 10): Promise<User[]> {
        const response = await this.getUsers({
            search: query,
            limit,
        });

        return response.data;
    }

    /**
     * Get detailed user information including entity data (vendor/employee)
     */
    async getUserDetails(userId: string): Promise<UserDetailsResponse> {
        return apiClient.get<UserDetailsResponse>(`/users/${userId}`);
    }

    /**
     * Approve a pending user account
     */
    async approveUser(userId: string): Promise<User> {
        return apiClient.patch<User>(`/users/${userId}/approve`);
    }

    /**
     * Reject a pending user account with optional reason
     */
    async rejectUser(userId: string, reason?: string): Promise<User> {
        return apiClient.patch<User>(
            `/users/${userId}/reject`,
            reason ? { reason } : undefined
        );
    }
}

export const userService = new UserService();
