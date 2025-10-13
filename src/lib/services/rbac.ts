import { apiClient as api } from "@/lib/api";
import {
    PermissionsResponse,
    RBACRole,
    UserRolesResponse,
    UserPermissionsResponse,
    RoleUsersResponse,
    CreateRoleDto,
    UpdateRoleDto,
    AssignRoleDto,
    BulkAssignRolesDto,
    RBACUser,
    RoleListResponse,
} from "@/lib/types/rbac";
import { PaginatedResponse } from "@/lib/types/api";
import { buildApiPath } from "@/lib/utils/queryParams";

export class RBACService {
    // Permission Management
    static async getAllPermissions(): Promise<PermissionsResponse> {
        return api.get<PermissionsResponse>("/admin/permissions");
    }

    // Role Management
    static async getAllRoles(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<RoleListResponse> {
        const path = buildApiPath("/admin/roles", params);
        return api.get<RoleListResponse>(path);
    }

    static async getRoleById(roleId: string): Promise<RBACRole> {
        return api.get<RBACRole>(`/admin/roles/${roleId}`);
    }

    static async createRole(roleData: CreateRoleDto): Promise<RBACRole> {
        return api.post<RBACRole>("/admin/roles", roleData);
    }

    static async updateRole(
        roleId: string,
        roleData: UpdateRoleDto
    ): Promise<RBACRole> {
        return api.patch<RBACRole>(`/admin/roles/${roleId}`, roleData);
    }

    static async archiveRole(roleId: string): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/admin/roles/${roleId}`);
    }

    static async getRoleUsers(
        roleId: string,
        params?: { page?: number; limit?: number }
    ): Promise<RoleUsersResponse> {
        const path = buildApiPath(`/admin/roles/${roleId}/users`, params);
        return api.get<RoleUsersResponse>(path);
    }

    // User Management - Updated to match new API structure
    static async getUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        accountType?: string;
    }): Promise<PaginatedResponse<RBACUser>> {
        const path = buildApiPath("/admin/users", params);
        return api.get<PaginatedResponse<RBACUser>>(path);
    }

    // User Role Assignment
    static async getUserRoles(userId: string): Promise<UserRolesResponse> {
        return api.get<UserRolesResponse>(`/admin/users/${userId}/roles`);
    }

    static async assignRoleToUser(
        userId: string,
        roleData: AssignRoleDto
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
        roleData: BulkAssignRolesDto
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
