import { apiClient } from "../api";
import { Employee, User } from "../types/auth";

export interface CreateEmployeeRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string;
    managerId?: string;
    contactEmail?: string;
    contactPhone?: string;
    physicalAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
    };
    mailingAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
    };
}

export interface UpdateEmployeeRequest {
    firstName?: string;
    lastName?: string;
    employeeId?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string;
    managerId?: string;
    contactEmail?: string;
    contactPhone?: string;
    physicalAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
    };
    mailingAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
    };
}

export interface EmployeeResponse {
    data: Employee[];
    total: number;
    page: number;
    limit: number;
}

export interface EmployeeWithUser extends Omit<Employee, "userId"> {
    userId: User;
}

export interface EmployeeResponseWithUser {
    data: EmployeeWithUser[];
    total: number;
    page: number;
    limit: number;
}

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
