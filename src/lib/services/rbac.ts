import { apiClient as api } from "@/lib/api";
import {
    PermissionsResponse,
    RBACRole,
    UserRolesResponse,
    UserPermissionsResponse,
    RoleUsersResponse,
    CreateRoleRequest,
    UpdateRoleRequest,
    AssignRoleRequest,
    BulkUpdateUserRolesRequest,
    RBACUser,
} from "@/lib/types/rbac";

export class RBACService {
    // Permission Management
    static async getAllPermissions(): Promise<PermissionsResponse> {
        return api.get<PermissionsResponse>("/admin/permissions");
    }

    // Role Management
    static async getAllRoles(): Promise<RBACRole[]> {
        return api.get<RBACRole[]>("/admin/roles");
    }

    static async getRoleById(roleId: string): Promise<RBACRole> {
        return api.get<RBACRole>(`/admin/roles/${roleId}`);
    }

    static async createRole(roleData: CreateRoleRequest): Promise<RBACRole> {
        return api.post<RBACRole>("/admin/roles", roleData);
    }

    static async updateRole(
        roleId: string,
        roleData: UpdateRoleRequest
    ): Promise<RBACRole> {
        return api.patch<RBACRole>(`/admin/roles/${roleId}`, roleData);
    }

    static async archiveRole(roleId: string): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/admin/roles/${roleId}`);
    }

    static async getRoleUsers(roleId: string): Promise<RoleUsersResponse> {
        return api.get<RoleUsersResponse>(`/admin/roles/${roleId}/users`);
    }

    // User Role Assignment
    static async getUserRoles(userId: string): Promise<UserRolesResponse> {
        return api.get<UserRolesResponse>(`/admin/users/${userId}/roles`);
    }

    static async assignRoleToUser(
        userId: string,
        roleData: AssignRoleRequest
    ): Promise<UserRolesResponse> {
        return api.post<UserRolesResponse>(
            `/admin/users/${userId}/roles`,
            roleData
        );
    }

    static async removeRoleFromUser(
        userId: string,
        roleId: string
    ): Promise<UserRolesResponse> {
        return api.delete<UserRolesResponse>(
            `/admin/users/${userId}/roles/${roleId}`
        );
    }

    static async bulkUpdateUserRoles(
        userId: string,
        roleData: BulkUpdateUserRolesRequest
    ): Promise<UserRolesResponse> {
        return api.patch<UserRolesResponse>(
            `/admin/users/${userId}/roles`,
            roleData
        );
    }

    static async getUserPermissions(
        userId: string
    ): Promise<UserPermissionsResponse> {
        return api.get<UserPermissionsResponse>(
            `/admin/users/${userId}/permissions`
        );
    }

    // Helper methods for frontend convenience
    static async getUsersWithRoles(): Promise<RBACUser[]> {
        // Discover users through role assignments - more realistic than a general user endpoint
        // This method aggregates users from all roles to build a comprehensive list
        try {
            const roles = await this.getAllRoles();
            const userMap = new Map<string, RBACUser>();

            // Collect users from each role
            await Promise.all(
                roles.map(async (role) => {
                    try {
                        const roleUsersResponse = await this.getRoleUsers(
                            role._id
                        );
                        roleUsersResponse.users.forEach((user) => {
                            if (!userMap.has(user._id)) {
                                // Add role count information for RBAC context
                                userMap.set(user._id, {
                                    ...user,
                                    totalRoles: 1,
                                });
                            } else {
                                // Increment role count for users with multiple roles
                                const existingUser = userMap.get(user._id)!;
                                userMap.set(user._id, {
                                    ...existingUser,
                                    totalRoles:
                                        (existingUser.totalRoles || 0) + 1,
                                });
                            }
                        });
                    } catch (error) {
                        // Log but don't fail the entire operation for one role
                        console.warn(
                            `Failed to fetch users for role ${role.name}:`,
                            error
                        );
                    }
                })
            );

            return Array.from(userMap.values()).sort((a, b) =>
                (a.fullName || a.email).localeCompare(b.fullName || b.email)
            );
        } catch (error) {
            console.error("Failed to fetch users with roles:", error);
            throw new Error("Failed to load users. Please try again.");
        }
    }

    // Validation helpers
    static validateRoleName(name: string): string | null {
        if (!name || name.trim().length < 2) {
            return "Role name must be at least 2 characters";
        }
        if (name.length > 50) {
            return "Role name must not exceed 50 characters";
        }
        return null;
    }

    static validateRoleDescription(description?: string): string | null {
        if (description && description.length > 255) {
            return "Description must not exceed 255 characters";
        }
        return null;
    }

    static validatePermissions(permissionIds: string[]): string | null {
        if (!permissionIds || permissionIds.length === 0) {
            return "At least one permission must be assigned";
        }
        return null;
    }
}
