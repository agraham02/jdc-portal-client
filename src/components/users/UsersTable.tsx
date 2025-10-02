"use client";

import { useEffect, useMemo, useState } from "react";
import {
    GenericTable,
    type GenericTableConfig,
} from "@/components/ui/generic-table";
import { UserDetailModal } from "./UserDetailModal";
import { RBACService } from "@/lib/services/rbac";
import { AuthService } from "@/lib/services/auth";
import type { RBACRole, RBACUser } from "@/lib/types/rbac";
import { RoleName, UserStatus } from "@/lib/types/auth";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useAuthz } from "@/lib/authz/useAuthz";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import StatusChip from "../common/statusChip";
import TextPreview from "../common/TextPreview";
import { useRouter } from "next/navigation";

export function UsersTable() {
    const router = useRouter();
    const { hasAny } = useAuthz();
    const canActivate = hasAny([P.USER_ACTIVATE]);

    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<RBACRole[]>([]);
    const [users, setUsers] = useState<RBACUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Track Admin role users to prevent removal of last admin via deactivation
    const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [allRoles, rbacUsers] = await Promise.all([
                RBACService.getAllRoles(),
                RBACService.getUsersWithRoles(),
            ]);
            setRoles(allRoles.data);
            setUsers(rbacUsers.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const loadAdmins = async () => {
            const admin = roles.find((r) => r.name === RoleName.ADMIN);
            if (!admin) {
                setAdminUserIds(new Set());
                return;
            }
            try {
                const resp = (await RBACService.getRoleUsers(admin._id)).data;
                setAdminUserIds(new Set(resp.map((u) => u._id)));
            } catch {
                setAdminUserIds(new Set());
            }
        };
        loadAdmins();
    }, [roles]);

    const doDeactivate = async (user: RBACUser) => {
        await AuthService.deactivateUser(user._id);
        setUsers((prev) =>
            prev.map((u) =>
                u._id === user._id ? { ...u, status: UserStatus.INACTIVE } : u
            )
        );
    };

    const doReactivate = async (user: RBACUser) => {
        await AuthService.reactivateUser(user._id);
        setUsers((prev) =>
            prev.map((u) =>
                u._id === user._id ? { ...u, status: UserStatus.ACTIVE } : u
            )
        );
    };

    const doUnlock = async (user: RBACUser) => {
        await AuthService.unlockUser(user._id);
    };

    const tableConfig: GenericTableConfig<RBACUser> = useMemo(() => {
        const isLastAdmin = (userId: string) =>
            adminUserIds.has(userId) && adminUserIds.size === 1;

        return {
            columns: [
                {
                    key: "name",
                    label: "Name",
                    render: (user) => {
                        const name =
                            user.firstName || user.lastName
                                ? `${user.firstName ?? ""} ${
                                      user.lastName ?? ""
                                  }`.trim()
                                : user.email;
                        return name;
                    },
                },
                {
                    key: "email",
                    label: "Email",
                    className: "text-muted-foreground",
                },
                {
                    key: "status",
                    label: "Status",
                    render: (user) => <StatusChip status={user.status} />,
                },
                {
                    key: "roles",
                    label: "Roles",
                    render: (user) => {
                        return (
                            <TextPreview
                                items={user.roles.map((role) => role.name)}
                            />
                        );
                    },
                },
            ],
            actions: [
                {
                    key: "manage-roles",
                    label: "Manage roles",
                    variant: "secondary",
                    render: (user: RBACUser) => (
                        <UserDetailModal
                            userId={user._id}
                            trigger={
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    Manage roles
                                </DropdownMenuItem>
                            }
                        />
                    ),
                },
                {
                    key: "view-details",
                    label: "View details",
                    variant: "ghost" as const,
                    onClick: (user: RBACUser) =>
                        router.push(`/users/${user._id}`),
                },
                ...(canActivate
                    ? [
                          {
                              key: "deactivate",
                              label: "Deactivate",
                              variant: "destructive" as const,
                              onClick: doDeactivate,
                              hidden: (user: RBACUser) =>
                                  user.status !== UserStatus.ACTIVE,
                              disabled: (user: RBACUser) =>
                                  isLastAdmin(user._id),
                          },
                          {
                              key: "reactivate",
                              label: "Reactivate",
                              variant: "default" as const,
                              onClick: doReactivate,
                              hidden: (user: RBACUser) =>
                                  user.status !== UserStatus.INACTIVE,
                          },
                          {
                              key: "unlock",
                              label: "Unlock",
                              variant: "ghost" as const,
                              onClick: doUnlock,
                          },
                      ]
                    : []),
            ],
            filters: [
                {
                    key: "search",
                    label: "Search",
                    type: "search",
                    placeholder: "Search name or email",
                    className: "w-64",
                },
                {
                    key: "status",
                    label: "Status",
                    type: "select",
                    className: "w-40",
                    options: [
                        { value: "Active", label: "Active" },
                        { value: "Pending", label: "Pending" },
                        { value: "Inactive", label: "Inactive" },
                    ],
                },
                {
                    key: "roleFilter",
                    label: "Role",
                    type: "select",
                    className: "w-56",
                    options: roles.map((r) => ({
                        value: r._id,
                        label: r.name,
                    })),
                },
            ],
            searchFields: ["email", "firstName", "lastName"],
            defaultPageSize: 25,
            enablePagination: true,
            loadingMessage: "Loading…",
            emptyMessage: "No users found",
            customFilter: (user, filters) => {
                // Status filter
                const statusFilter = filters.status;
                if (
                    statusFilter &&
                    statusFilter !== "all" &&
                    user.status !== statusFilter
                ) {
                    return false;
                }

                // Role filter - check if user has the selected role
                const roleFilter = filters.roleFilter;
                if (roleFilter && roleFilter !== "all") {
                    if (!Array.isArray(user.roles)) return false;

                    const hasRole = user.roles.some((r) => {
                        if (typeof r === "string") return r === roleFilter;
                        return (
                            (r as unknown as { _id: string })._id === roleFilter
                        );
                    });
                    if (!hasRole) return false;
                }

                return true;
            },
        };
    }, [canActivate, roles, router, adminUserIds]);

    return (
        <>
            <GenericTable
                data={users}
                loading={loading}
                error={error}
                config={tableConfig}
                onRefresh={loadData}
            />
        </>
    );
}
