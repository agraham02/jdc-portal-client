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
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { UserStatus } from "@/lib/types/auth";
import { useRouter } from "next/navigation";
import { StatusBadge } from "../common";

export function EmployeesTable() {
    const router = useRouter();
    const { hasAny } = useAuthz();
    const canRead = hasAny([P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]);
    const canUpdate = hasAny([P.EMPLOYEE_UPDATE]);
    const canDelete = hasAny([P.EMPLOYEE_DELETE]);

    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<EmployeeWithUser[]>([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [error, setError] = useState<string | null>(null);

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
                    { value: UserStatus.INACTIVE, label: "Inactive" },
                ],
            },
            {
                key: "department",
                label: "Department",
                type: "select",
                className: "w-48",
                options: [
                    { value: "Engineering", label: "Engineering" },
                    { value: "HR", label: "Human Resources" },
                    { value: "Sales", label: "Sales" },
                    { value: "Marketing", label: "Marketing" },
                    { value: "Finance", label: "Finance" },
                    { value: "Operations", label: "Operations" },
                ],
            },
        ],
        []
    );

    const tableState = useTableState<EmployeeWithUser>({
        filters: filterDefinitions,
        defaultPageSize: 25,
        enablePagination: true,
    } as GenericTableConfig<EmployeeWithUser>);

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
        setError(null);
        try {
            const response = await EmployeeService.getEmployees({
                page,
                pageSize,
                search: searchFilter || undefined,
                status: statusFilter,
                department: departmentFilter,
            });
            setEmployees(response.data);
            setTotalEmployees(response.total);
            if (response.page && response.page !== page) {
                setPage(response.page);
            }
            if (response.pageSize && response.pageSize !== pageSize) {
                setPageSize(response.pageSize);
            }
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load employees"
            );
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
            await EmployeeService.deleteEmployee(employee.userId._id);
            await loadEmployees(); // Refresh the list
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
                        <StatusBadge type="user" status={employee.userId.status} />
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
    }, [canUpdate, canDelete, loadEmployees, router, filterDefinitions]);

    if (!canRead) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                You don&apos;t have permission to view employees.
            </div>
        );
    }

    return (
        <GenericTable
            data={employees}
            loading={loading}
            error={error}
            config={tableConfig}
            onRefresh={loadEmployees}
            state={tableState}
            totalItems={totalEmployees}
        />
    );
}
