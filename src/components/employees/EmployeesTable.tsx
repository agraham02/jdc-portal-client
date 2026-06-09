"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    GenericTable,
    type GenericTableConfig,
    useTableState,
} from "@/components/ui/generic-table";
import {
    EmployeeService,
    type EmployeeWithUser,
} from "@/lib/services/employee";
import { AuthService } from "@/lib/services/auth";
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { DEPARTMENT_OPTIONS } from "@/lib/constants/departments";
import { useErrorState } from "@/lib/hooks/useErrorState";
import { apiToast } from "@/lib/utils/toast-helpers";
import { errorMessages, successMessages } from "@/lib/utils/error-messages";
import { UserStatus } from "@/lib/types/auth";
import { useRouter } from "next/navigation";
import { StatusBadge } from "../common";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function EmployeesTable() {
    const router = useRouter();
    const { hasAny } = useAuthz();
    const canRead = hasAny([P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]);
    const canUpdate = hasAny([P.EMPLOYEE_UPDATE]);
    const canDelete = hasAny([P.EMPLOYEE_DELETE]);
    const canActivate = hasAny([P.USER_ACTIVATE]);
    const canResendActivation = hasAny([P.EMPLOYEE_CREATE, P.EMPLOYEE_UPDATE]);

    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<EmployeeWithUser[]>([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const { error, setError, clearError } = useErrorState();

    // Holds the one-time temporary password returned after admin activation,
    // shown to the admin in a dialog to share securely with the employee.
    const [tempPasswordInfo, setTempPasswordInfo] = useState<{
        email: string;
        password: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const filterDefinitions = useMemo<
        GenericTableConfig<EmployeeWithUser>["filters"]
    >(
        () => [
            {
                key: "search",
                label: "Search",
                type: "search",
                placeholder: "Search name, email, or employee ID",
                className: "w-64",
            },
            {
                key: "status",
                label: "Status",
                type: "select",
                className: "w-40",
                options: [
                    { value: UserStatus.ACTIVE, label: "Active" },
                    { value: UserStatus.PENDING, label: "Pending" },
                    { value: UserStatus.ONBOARDING, label: "Onboarding" },
                    { value: UserStatus.INACTIVE, label: "Inactive" },
                    { value: UserStatus.TERMINATED, label: "Terminated" },
                ],
            },
            {
                key: "department",
                label: "Department",
                type: "select",
                className: "w-48",
                options: DEPARTMENT_OPTIONS,
            },
        ],
        [],
    );

    const tableState = useTableState({
        filters: filterDefinitions,
        defaultPageSize: 25,
    });

    const {
        page,
        pageSize,
        filters: activeFilters,
        setPage,
        setPageSize,
    } = tableState;
    const searchFilter = activeFilters.search?.trim() ?? "";
    const statusFilter =
        activeFilters.status && activeFilters.status !== "all"
            ? (activeFilters.status as UserStatus)
            : undefined;
    const departmentFilter =
        activeFilters.department && activeFilters.department !== "all"
            ? activeFilters.department
            : undefined;

    const loadEmployees = useCallback(async () => {
        if (!canRead) return;

        setLoading(true);
        clearError();
        try {
            const response = await EmployeeService.getEmployees({
                page,
                limit: pageSize,
                search: searchFilter || undefined,
                status: statusFilter,
                department: departmentFilter,
            });
            setEmployees(response.data);
            setTotalEmployees(response.total);
            if (response.page && response.page !== page) {
                setPage(response.page);
            }
            if (response.limit && response.limit !== pageSize) {
                setPageSize(response.limit);
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [
        canRead,
        page,
        pageSize,
        searchFilter,
        statusFilter,
        departmentFilter,
        setPage,
        setPageSize,
        clearError,
        setError,
    ]);

    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString();
    };

    const tableConfig: GenericTableConfig<EmployeeWithUser> = useMemo(() => {
        const handleDeactivate = async (employee: EmployeeWithUser) => {
            try {
                await EmployeeService.deleteEmployee(employee.userId._id);
                apiToast.success(successMessages.employees.deleted);
                await loadEmployees(); // Refresh the list
            } catch (error) {
                apiToast.error(errorMessages.employees.delete, error);
            }
        };

        const handleReactivate = async (employee: EmployeeWithUser) => {
            try {
                await AuthService.reactivateUser(employee.userId._id);
                apiToast.success("Employee reactivated");
                await loadEmployees(); // Refresh the list
            } catch (error) {
                apiToast.error("Failed to reactivate employee", error);
            }
        };

        const handleResumeOnboarding = async (employee: EmployeeWithUser) => {
            try {
                await AuthService.resumeOnboarding(employee.userId._id);
                apiToast.success(
                    "Employee returned to onboarding and invite resent",
                );
                await loadEmployees(); // Refresh the list
            } catch (error) {
                apiToast.error("Failed to resend onboarding invite", error);
            }
        };

        const handleActivate = async (employee: EmployeeWithUser) => {
            try {
                const { temporaryPassword } = await AuthService.activateUser(
                    employee.userId._id,
                );
                setTempPasswordInfo({
                    email: employee.userId.email,
                    password: temporaryPassword,
                });
                await loadEmployees(); // Refresh the list
            } catch (error) {
                apiToast.error("Failed to activate employee", error);
            }
        };

        return {
            columns: [
                {
                    key: "name",
                    label: "Name",
                    render: (employee) => {
                        const user = employee.userId;
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
                    render: (employee) => employee.userId.email,
                    className: "text-muted-foreground",
                },
                {
                    key: "employeeId",
                    label: "Employee ID",
                    render: (employee) => employee.employeeId || "—",
                },
                {
                    key: "jobTitle",
                    label: "Job Title",
                    render: (employee) => employee.jobTitle || "—",
                },
                {
                    key: "department",
                    label: "Department",
                    render: (employee) => employee.department || "—",
                },
                {
                    key: "hireDate",
                    label: "Hire Date",
                    render: (employee) => formatDate(employee.hireDate),
                },
                {
                    key: "status",
                    label: "Status",
                    render: (employee) => (
                        <StatusBadge
                            type="user"
                            status={employee.userId.status}
                        />
                    ),
                },
            ],
            actions: [
                ...(canUpdate
                    ? [
                          {
                              key: "view",
                              label: "View details",
                              variant: "secondary" as const,
                              onClick: (employee: EmployeeWithUser) => {
                                  // Navigate to edit page or open edit dialog
                                  router.push(`/employees/${employee._id}`);
                              },
                          },
                      ]
                    : []),
                ...(canResendActivation
                    ? [
                          {
                              key: "resend",
                              label: "Resend activation",
                              variant: "secondary" as const,
                              onClick: async (employee: EmployeeWithUser) => {
                                  try {
                                      await AuthService.resendActivation(
                                          employee.userId._id,
                                      );
                                      apiToast.success("Activation email sent");
                                      await loadEmployees();
                                  } catch (err) {
                                      apiToast.error(
                                          errorMessages.auth.resendVerification,
                                          err,
                                      );
                                  }
                              },
                              hidden: (employee: EmployeeWithUser) => {
                                  // Show for pending/onboarding accounts (activation not yet complete)
                                  return !(
                                      employee.userId.status ===
                                          UserStatus.PENDING ||
                                      employee.userId.status ===
                                          UserStatus.ONBOARDING
                                  );
                              },
                          },
                      ]
                    : []),
                ...(canDelete
                    ? [
                          {
                              key: "deactivate",
                              label: "Deactivate",
                              variant: "destructive" as const,
                              onClick: handleDeactivate,
                              hidden: (employee: EmployeeWithUser) =>
                                  employee.userId.status ===
                                  UserStatus.INACTIVE,
                          },
                      ]
                    : []),
                ...(canActivate
                    ? [
                          {
                              key: "reactivate",
                              label: "Reactivate",
                              variant: "default" as const,
                              onClick: handleReactivate,
                              hidden: (employee: EmployeeWithUser) =>
                                  employee.userId.status !==
                                  UserStatus.INACTIVE,
                          },
                          {
                              key: "resume-onboarding",
                              label: "Reactivate & resend invite",
                              variant: "secondary" as const,
                              onClick: handleResumeOnboarding,
                              hidden: (employee: EmployeeWithUser) =>
                                  employee.userId.status !==
                                  UserStatus.INACTIVE,
                          },
                          {
                              key: "activate-temp-password",
                              label: "Activate with temporary password",
                              variant: "secondary" as const,
                              onClick: handleActivate,
                              hidden: (employee: EmployeeWithUser) =>
                                  // Admin override for accounts that can't finish
                                  // the normal invite flow. Hidden for already-active
                                  // and terminal accounts.
                                  employee.userId.status ===
                                      UserStatus.ACTIVE ||
                                  employee.userId.status ===
                                      UserStatus.TERMINATED ||
                                  employee.userId.status ===
                                      UserStatus.REJECTED ||
                                  employee.userId.status ===
                                      UserStatus.ARCHIVED,
                          },
                      ]
                    : []),
            ],
            filters: filterDefinitions,
            statusConfig: {
                Active: { variant: "default" },
                Pending: { variant: "secondary" },
                Inactive: { variant: "outline" },
            },
            searchFields: [
                (employee) => employee.userId.email,
                (employee) => employee.userId.firstName,
                (employee) => employee.userId.lastName,
                "employeeId",
                "jobTitle",
            ],
            defaultPageSize: 25,
            enablePagination: true,
            manualFiltering: true,
            manualPagination: true,
            loadingMessage: "Loading employees…",
            emptyMessage: "No employees found",
        };
    }, [
        canUpdate,
        canDelete,
        canActivate,
        loadEmployees,
        router,
        filterDefinitions,
        canResendActivation,
    ]);

    if (!canRead) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                You don&apos;t have permission to view employees.
            </div>
        );
    }

    const copyTempPassword = async () => {
        if (!tempPasswordInfo) return;
        try {
            await navigator.clipboard.writeText(tempPasswordInfo.password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            apiToast.error("Couldn't copy to clipboard");
        }
    };

    return (
        <>
            <GenericTable
                data={employees}
                loading={loading}
                error={error}
                config={tableConfig}
                onRefresh={loadEmployees}
                state={tableState}
                totalItems={totalEmployees}
            />
            <Dialog
                open={!!tempPasswordInfo}
                onOpenChange={(open) => {
                    if (!open) {
                        setTempPasswordInfo(null);
                        setCopied(false);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Temporary password created</DialogTitle>
                        <DialogDescription>
                            Share this one-time password securely with{" "}
                            <span className="font-medium">
                                {tempPasswordInfo?.email}
                            </span>
                            . They must change it the next time they sign in.
                            This password won&apos;t be shown again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                        <code className="flex-1 break-all font-mono text-sm">
                            {tempPasswordInfo?.password}
                        </code>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={copyTempPassword}
                            aria-label="Copy password"
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => {
                                setTempPasswordInfo(null);
                                setCopied(false);
                            }}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
