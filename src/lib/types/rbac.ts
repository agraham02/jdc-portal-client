// RBAC-specific types for role and permission management

import { User, Permission, Role } from "./auth";

// Extended permission interface for RBAC management
export interface RBACPermission extends Permission {
    category?: string;
    fromRole?: string; // Used when viewing user's computed permissions
}

// Extended role interface for RBAC management
export interface RBACRole extends Role {
    isCustom: boolean;
    isActive: boolean;
    userCount?: number; // Number of users with this role
    createdAt?: string;
    updatedAt?: string;
}

// User with role assignment information
export interface RBACUser extends User {
    totalRoles?: number;
}

// API Response types
export interface PermissionsResponse {
    permissions: RBACPermission[];
    categorized: Record<string, RBACPermission[]>;
    totalPermissions: number;
}

export interface RolesResponse {
    roles: RBACRole[];
    totalRoles: number;
}

export interface UserRolesResponse {
    user: RBACUser;
    roles: RBACRole[];
    totalRoles: number;
}

export interface UserPermissionsResponse {
    user: RBACUser;
    permissions: RBACPermission[];
    totalPermissions: number;
}

export interface RoleUsersResponse {
    role: RBACRole;
    users: RBACUser[];
    totalUsers: number;
}

// Form data types
export interface CreateRoleRequest {
    name: string;
    description?: string;
    permissionIds: string[];
}

export interface UpdateRoleRequest {
    name?: string;
    description?: string;
    permissionIds?: string[];
}

export interface AssignRoleRequest {
    roleId: string;
}

export interface BulkUpdateUserRolesRequest {
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
