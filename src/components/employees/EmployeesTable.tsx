"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    GenericTable,
    type GenericTableConfig,
} from "@/components/ui/generic-table";
import {
    EmployeeService,
    type EmployeeWithUser,
} from "@/lib/services/employee";
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { UserStatus } from "@/lib/types/auth";
import StatusChip from "../common/statusChip";
import { useRouter } from "next/navigation";

export function EmployeesTable() {
    const router = useRouter();
    const { hasAny } = useAuthz();
    const canRead = hasAny([P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]);
    const canUpdate = hasAny([P.EMPLOYEE_UPDATE]);
    const canDelete = hasAny([P.EMPLOYEE_DELETE]);

    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<EmployeeWithUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadEmployees = useCallback(async () => {
        if (!canRead) return;

        setLoading(true);
        setError(null);
        try {
            const response = await EmployeeService.getEmployees();
            setEmployees(response.data);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load employees"
            );
        } finally {
            setLoading(false);
        }
    }, [canRead]);

    useEffect(() => {
        loadEmployees();
    }, [canRead, loadEmployees]);

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
                        <StatusChip status={employee.userId.status} />
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
            filters: [
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
                        { value: "Active", label: "Active" },
                        { value: "Pending", label: "Pending" },
                        { value: "Inactive", label: "Inactive" },
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
            statusConfig: {
                Active: { variant: "default" },
                Pending: { variant: "secondary" },
                Inactive: { variant: "outline" },
            },
            searchFields: ["userId", "employeeId", "jobTitle"], // Note: userId search would need custom handling
            defaultPageSize: 25,
            enablePagination: true,
            loadingMessage: "Loading employees…",
            emptyMessage: "No employees found",
            customFilter: (employee, filters) => {
                // Status filter
                const statusFilter = filters.status;
                if (
                    statusFilter &&
                    statusFilter !== "all" &&
                    employee.userId.status !== statusFilter
                ) {
                    return false;
                }

                // Department filter
                const departmentFilter = filters.department;
                if (
                    departmentFilter &&
                    departmentFilter !== "all" &&
                    employee.department !== departmentFilter
                ) {
                    return false;
                }

                // Custom search for user fields
                const searchFilter = filters.search;
                if (searchFilter) {
                    const query = searchFilter.toLowerCase();
                    const user = employee.userId;
                    const searchableFields = [
                        user.email,
                        user.firstName,
                        user.lastName,
                        employee.employeeId,
                        employee.jobTitle,
                    ].filter(Boolean);

                    const matches = searchableFields.some((field) =>
                        String(field).toLowerCase().includes(query)
                    );
                    if (!matches) return false;
                }

                return true;
            },
        };
    }, [canUpdate, canDelete, loadEmployees, router]);

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
        />
    );
}
