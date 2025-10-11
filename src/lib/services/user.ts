import { BaseService } from "./base";
import type { User, UserDetailsResponse } from "@/lib/types/auth";
import type { QueryParams } from "@/lib/utils/queryParams";

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

/**
 * User management service
 * Handles user CRUD operations, approval workflows, and search functionality
 */
export class UserService extends BaseService {
    private static readonly BASE_PATH = "/admin/users";
    private static readonly USER_PATH = "/users";

    /**
     * Get all users with pagination and filtering (admin only)
     *
     * @param params - Query parameters for filtering and pagination
     * @returns List of users with total count
     *
     * @example
     * ```typescript
     * const users = await UserService.getUsers({
     *   page: 1,
     *   limit: 20,
     *   status: 'active'
     * });
     * ```
     */
    static async getUsers(
        params: UserQueryParams = {}
    ): Promise<UserListResponse> {
        const path = this.buildPath(this.BASE_PATH, params as QueryParams);
        return this.get<UserListResponse>(path);
    }

    /**
     * Get user by ID
     *
     * @param userId - User ID
     * @returns User object
     */
    static async getUserById(userId: string): Promise<User> {
        return this.get<User>(`${this.USER_PATH}/${userId}`);
    }

    /**
     * Update user by ID (admin)
     *
     * @param userId - User ID
     * @param data - Partial user data to update
     * @returns Updated user object
     */
    static async updateUser(
        userId: string,
        data: Partial<User>
    ): Promise<User> {
        return this.patch<User>(`${this.BASE_PATH}/${userId}`, data);
    }

    /**
     * Search users by name or email
     *
     * @param query - Search query string
     * @param limit - Maximum number of results (default: 10)
     * @returns Array of matching users
     *
     * @example
     * ```typescript
     * const users = await UserService.searchUsers('john', 5);
     * ```
     */
    static async searchUsers(
        query: string,
        limit: number = 10
    ): Promise<User[]> {
        const response = await this.getUsers({
            search: query,
            limit,
        });

        return response.data;
    }

    /**
     * Get detailed user information including entity data (vendor/employee)
     *
     * @param userId - User ID
     * @returns Detailed user information with associated entity data
     */
    static async getUserDetails(userId: string): Promise<UserDetailsResponse> {
        return this.get<UserDetailsResponse>(`${this.USER_PATH}/${userId}`);
    }

    /**
     * Approve a pending user account
     *
     * @param userId - User ID to approve
     * @returns Updated user object with active status
     *
     * @example
     * ```typescript
     * const approvedUser = await UserService.approveUser('user-id-123');
     * ```
     */
    static async approveUser(userId: string): Promise<User> {
        return this.patch<User>(`${this.USER_PATH}/${userId}/approve`, {});
    }

    /**
     * Reject a pending user account with optional reason
     *
     * @param userId - User ID to reject
     * @param reason - Optional rejection reason
     * @returns Updated user object with rejected status
     *
     * @example
     * ```typescript
     * await UserService.rejectUser('user-id-123', 'Invalid credentials');
     * ```
     */
    static async rejectUser(userId: string, reason?: string): Promise<User> {
        return this.patch<User>(
            `${this.USER_PATH}/${userId}/reject`,
            reason ? { reason } : {}
        );
    }
}

// Export singleton instance for backward compatibility
// New code should use static methods: UserService.getUsers()
export const userService = UserService;
