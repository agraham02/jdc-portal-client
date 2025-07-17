import { useState, useEffect, useCallback } from "react";
import { RBACService } from "@/lib/services/rbac";
import {
    PermissionsResponse,
    RBACRole,
    UserRolesResponse,
    UserPermissionsResponse,
    RoleUsersResponse,
    CreateRoleRequest,
    UpdateRoleRequest,
} from "@/lib/types/rbac";

// Hook for managing permissions data
export function usePermissions() {
    const [permissions, setPermissions] = useState<PermissionsResponse | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await RBACService.getAllPermissions();
            setPermissions(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch permissions"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    return {
        permissions,
        loading,
        error,
        refetch: fetchPermissions,
    };
}

// Hook for managing roles data
export function useRoles() {
    const [roles, setRoles] = useState<RBACRole[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await RBACService.getAllRoles();
            setRoles(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch roles"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const createRole = useCallback(async (roleData: CreateRoleRequest) => {
        try {
            const newRole = await RBACService.createRole(roleData);
            setRoles((prev) => [...prev, newRole]);
            return newRole;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateRole = useCallback(
        async (roleId: string, roleData: UpdateRoleRequest) => {
            try {
                const updatedRole = await RBACService.updateRole(
                    roleId,
                    roleData
                );
                setRoles((prev) =>
                    prev.map((role) =>
                        role._id === roleId ? updatedRole : role
                    )
                );
                return updatedRole;
            } catch (err) {
                throw err;
            }
        },
        []
    );

    const archiveRole = useCallback(async (roleId: string) => {
        try {
            await RBACService.archiveRole(roleId);
            setRoles((prev) => prev.filter((role) => role._id !== roleId));
        } catch (err) {
            throw err;
        }
    }, []);

    return {
        roles,
        loading,
        error,
        refetch: fetchRoles,
        createRole,
        updateRole,
        archiveRole,
    };
}

// Hook for managing user roles
export function useUserRoles(userId: string) {
    const [userRoles, setUserRoles] = useState<UserRolesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserRoles = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await RBACService.getUserRoles(userId);
            setUserRoles(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch user roles"
            );
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserRoles();
    }, [fetchUserRoles]);

    const assignRole = useCallback(
        async (roleId: string) => {
            try {
                const updatedUserRoles = await RBACService.assignRoleToUser(
                    userId,
                    { roleId }
                );
                setUserRoles(updatedUserRoles);
                return updatedUserRoles;
            } catch (err) {
                throw err;
            }
        },
        [userId]
    );

    const removeRole = useCallback(
        async (roleId: string) => {
            try {
                const updatedUserRoles = await RBACService.removeRoleFromUser(
                    userId,
                    roleId
                );
                setUserRoles(updatedUserRoles);
                return updatedUserRoles;
            } catch (err) {
                throw err;
            }
        },
        [userId]
    );

    const bulkUpdateRoles = useCallback(
        async (roleIds: string[]) => {
            try {
                const updatedUserRoles = await RBACService.bulkUpdateUserRoles(
                    userId,
                    { roleIds }
                );
                setUserRoles(updatedUserRoles);
                return updatedUserRoles;
            } catch (err) {
                throw err;
            }
        },
        [userId]
    );

    return {
        userRoles,
        loading,
        error,
        refetch: fetchUserRoles,
        assignRole,
        removeRole,
        bulkUpdateRoles,
    };
}

// Hook for managing user permissions view
export function useUserPermissions(userId: string) {
    const [userPermissions, setUserPermissions] =
        useState<UserPermissionsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserPermissions = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await RBACService.getUserPermissions(userId);
            setUserPermissions(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch user permissions"
            );
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserPermissions();
    }, [fetchUserPermissions]);

    return {
        userPermissions,
        loading,
        error,
        refetch: fetchUserPermissions,
    };
}

// Hook for managing role users
export function useRoleUsers(roleId: string) {
    const [roleUsers, setRoleUsers] = useState<RoleUsersResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoleUsers = useCallback(async () => {
        if (!roleId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await RBACService.getRoleUsers(roleId);
            setRoleUsers(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch role users"
            );
        } finally {
            setLoading(false);
        }
    }, [roleId]);

    useEffect(() => {
        fetchRoleUsers();
    }, [fetchRoleUsers]);

    return {
        roleUsers,
        loading,
        error,
        refetch: fetchRoleUsers,
    };
}

// Hook for RBAC data caching
export function useRBACCache() {
    const [cache, setCache] = useState<{
        permissions: PermissionsResponse | null;
        roles: RBACRole[] | null;
        lastFetched: Date | null;
    }>({
        permissions: null,
        roles: null,
        lastFetched: null,
    });

    const isDataFresh = useCallback(
        (lastFetched: Date | null, maxAge = 5 * 60 * 1000) => {
            if (!lastFetched) return false;
            return Date.now() - lastFetched.getTime() < maxAge;
        },
        []
    );

    const getCachedPermissions = useCallback(async () => {
        if (cache.permissions && isDataFresh(cache.lastFetched)) {
            return cache.permissions;
        }

        const permissions = await RBACService.getAllPermissions();
        setCache((prev) => ({
            ...prev,
            permissions,
            lastFetched: new Date(),
        }));

        return permissions;
    }, [cache.permissions, cache.lastFetched, isDataFresh]);

    const getCachedRoles = useCallback(async () => {
        if (cache.roles && isDataFresh(cache.lastFetched)) {
            return cache.roles;
        }

        const roles = await RBACService.getAllRoles();
        setCache((prev) => ({
            ...prev,
            roles,
            lastFetched: new Date(),
        }));

        return roles;
    }, [cache.roles, cache.lastFetched, isDataFresh]);

    const clearCache = useCallback(() => {
        setCache({
            permissions: null,
            roles: null,
            lastFetched: null,
        });
    }, []);

    return {
        cache,
        getCachedPermissions,
        getCachedRoles,
        clearCache,
        isDataFresh: (lastFetched: Date | null) => isDataFresh(lastFetched),
    };
}
