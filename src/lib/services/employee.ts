import { apiClient } from "@/lib/api";
import { Employee, User, UserStatus } from "../types/auth";
import { PaginatedResponse } from "../types/api";

export type EmployeeWithUser = Omit<Employee, "userId"> & {
    userId: User & { status: UserStatus };
};

export type EmployeeListResponse = PaginatedResponse<EmployeeWithUser>;

export interface CreateEmployeeDto {
    userId: string;
    employeeId?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string; // ISO date string
    managerId?: string;
}

export interface UpdateEmployeeDto {
    employeeId?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string; // ISO date string
    managerId?: string;
}

export class EmployeeService {
    /**
     * Get all employees with pagination and filtering
     */
    static async getEmployees(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        department?: string;
        status?: UserStatus;
    }): Promise<EmployeeListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.pageSize)
            queryParams.append("pageSize", params.pageSize.toString());
        if (params?.search) queryParams.append("search", params.search);
        if (params?.department)
            queryParams.append("department", params.department);
        if (params?.status) queryParams.append("status", params.status);

        const query = queryParams.toString();
        return apiClient.get<EmployeeListResponse>(
            `/employees${query ? `?${query}` : ""}`
        );
    }

    /**
     * Get pending employees
     */
    static async getPendingEmployees(): Promise<EmployeeListResponse> {
        return apiClient.get<EmployeeListResponse>("/employees/pending");
    }

    /**
     * Get employee by ID
     */
    static async getEmployee(id: string): Promise<EmployeeWithUser> {
        return apiClient.get<EmployeeWithUser>(`/employees/${id}`);
    }

    /**
     * Create a new employee
     */
    static async createEmployee(
        employeeData: CreateEmployeeDto
    ): Promise<{ message: string; employee: EmployeeWithUser }> {
        return apiClient.post<{ message: string; employee: EmployeeWithUser }>(
            "/employees",
            employeeData
        );
    }

    /**
     * Update an employee
     */
    static async updateEmployee(
        id: string,
        employeeData: UpdateEmployeeDto
    ): Promise<{ message: string; employee: EmployeeWithUser }> {
        return apiClient.patch<{ message: string; employee: EmployeeWithUser }>(
            `/employees/${id}`,
            employeeData
        );
    }

    /**
     * Delete (deactivate) an employee
     */
    static async deleteEmployee(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/employees/${id}`);
    }
}
