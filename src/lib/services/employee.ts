import { apiClient } from "@/lib/api";
import { Employee, User, UserStatus } from "../types/auth";

export type EmployeeWithUser = Omit<Employee, "userId"> & {
    userId: User & { status: UserStatus };
};

export type EmployeeResponseWithUser = {
    data: EmployeeWithUser[];
    total: number;
    page?: number;
    limit?: number;
};

export type CreateEmployeeRequest = Partial<Employee> & {
    userId: string;
};

export type UpdateEmployeeRequest = Partial<Employee>;

export class EmployeeService {
    /**
     * Get all employees with pagination
     */
    static async getEmployees(
        page = 1,
        limit = 10
    ): Promise<EmployeeResponseWithUser> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        return apiClient.get<EmployeeResponseWithUser>(`/employees?${params}`);
    }

    /**
     * Get pending employees
     */
    static async getPendingEmployees(): Promise<EmployeeResponseWithUser> {
        return apiClient.get<EmployeeResponseWithUser>("/employees/pending");
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
        employeeData: CreateEmployeeRequest
    ): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>("/employees", employeeData);
    }

    /**
     * Update an employee
     */
    static async updateEmployee(
        id: string,
        employeeData: UpdateEmployeeRequest
    ): Promise<{ message: string }> {
        return apiClient.patch<{ message: string }>(
            `/employees/${id}`,
            employeeData
        );
    }

    /**
     * Approve a pending employee
     */
    static async approveEmployee(id: string): Promise<{ message: string }> {
        return apiClient.patch<{ message: string }>(
            `/employees/${id}/approve`,
            {}
        );
    }

    /**
     * Delete (deactivate) an employee
     */
    static async deleteEmployee(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/employees/${id}`);
    }
}
