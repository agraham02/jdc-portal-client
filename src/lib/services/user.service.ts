import { apiClient } from "../api";
import type { Address } from "../types/auth";

interface UpdateUserDto {
    email?: string;
    contactPhone?: string;
    contactEmail?: string;
    physicalAddress?: Address;
    mailingAddress?: Address;
}

export const UserService = {
    /**
     * Update user contact information and addresses (admin only)
     */
    async updateUser(
        userId: string,
        data: UpdateUserDto
    ): Promise<{ message: string; userId: string }> {
        return apiClient.patch<{ message: string; userId: string }>(
            `/users/${userId}`,
            data
        );
    },
};
