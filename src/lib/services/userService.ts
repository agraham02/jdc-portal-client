import { apiClient } from "@/lib/api";
import { User } from "@/lib/types/auth";

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
        return apiClient.get<User>(`/admin/users/${userId}`);
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
}

export const userService = new UserService();
