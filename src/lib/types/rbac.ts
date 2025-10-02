// RBAC-specific types for role and permission management

import { User, Permission, Role } from "./auth";
import { PaginatedResponse } from "./api";

// Extended permission interface for RBAC management
export interface RBACPermission extends Permission {
    category?: string;
    fromRole?: string; // Used when viewing user's computed permissions
}

// Extended role interface for RBAC management
export interface RBACRole extends Role {
    isCustom?: boolean;
    isActive?: boolean;
    userCount?: number; // Number of users with this role
    createdAt?: string;
    updatedAt?: string;
}

// User with role assignment information - extends User but includes populated roles
export interface RBACUser extends User {
    totalRoles?: number;
    roles: RBACRole[]; // Always populated in RBAC context
}

// API Response types matching new API structure
export interface PermissionsResponse {
    permissions: RBACPermission[];
    categorized?: Record<string, RBACPermission[]>;
}

export type RoleListResponse = PaginatedResponse<RBACRole>;

export interface UserRolesResponse {
    user: RBACUser;
    roles: RBACRole[];
}

export interface UserPermissionsResponse {
    user: RBACUser;
    permissions: RBACPermission[];
}

export interface RoleUsersResponse extends PaginatedResponse<RBACUser> {
    role: RBACRole;
    totalUsers?: number;
}

// DTO types matching the new API
export interface CreateRoleDto {
    name: string;
    description?: string;
    permissions: string[]; // Array of permission IDs
}

export interface UpdateRoleDto {
    name?: string;
    description?: string;
    permissions?: string[]; // Array of permission IDs
}

// Type aliases for backward compatibility
export type CreateRoleRequest = CreateRoleDto;
export type UpdateRoleRequest = UpdateRoleDto;

export interface AssignRoleDto {
    roleId: string;
}

export interface BulkAssignRolesDto {
    roleIds: string[];
}

// UI State types
export interface RoleFilters {
    type: "all" | "system" | "custom";
    status: "all" | "active" | "inactive";
    search?: string;
}

export interface PermissionFilters {
    category?: string;
    search?: string;
}

export interface UserFilters {
    status?: string;
    accountType?: string;
    search?: string;
}

// Error types
export interface RBACError {
    message: string;
    field?: string;
    code?: string;
}

export interface ValidationErrors {
    [field: string]: string[];
}
