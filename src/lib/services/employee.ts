import { apiClient } from "@/lib/api";
import { Employee, User, UserStatus } from "../types/auth";
import { PaginatedResponse } from "../types/api";
import { buildApiPath } from "@/lib/utils/queryParams";

export type EmployeeWithUser = Omit<Employee, "userId"> & {
    userId: User & { status: UserStatus };
};

export type EmployeeListResponse = PaginatedResponse<EmployeeWithUser>;

export interface CreateEmployeeDto {
    email: string;
    employeeId?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string; // ISO date string
    managerId?: string;
    /**
     * Mark email as transferable/shared (e.g. role-based inbox). Anonymization
     * will free this email for reuse when the account is deleted.
     */
    isTransferableEmail?: boolean;
}

export interface CompleteEmployeeOnboardingDto {
    activationToken: string;
    firstName: string;
    lastName: string;
    password: string;
    contactPhone?: string;
    contactEmail?: string;
}

export interface UpdateEmployeeDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    employeeId?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string; // ISO date string
    managerId?: string;
    status?: UserStatus;
    contactPhone?: string;
    contactEmail?: string;
}

export class EmployeeService {
    /**
     * Get all employees with pagination and filtering
     */
    static async getEmployees(params?: {
        page?: number;
        limit?: number;
        search?: string;
        department?: string;
        status?: UserStatus;
    }): Promise<EmployeeListResponse> {
        const path = buildApiPath("/employees", {
            page: params?.page,
            limit: params?.limit,
            search: params?.search,
            department: params?.department,
            status: params?.status,
        });
        return apiClient.get<EmployeeListResponse>(path);
    }

    /**
     * Get pending employees
     */
    static async getPendingEmployees(): Promise<EmployeeListResponse> {
        return apiClient.get<EmployeeListResponse>("/employees/pending");
    }

    /**
     * Get current employee profile (for employees to view their own profile)
     */
    static async getMyProfile(): Promise<EmployeeWithUser> {
        return apiClient.get<EmployeeWithUser>("/employees/me");
    }

    /**
     * Get the current user's direct reports (one level). Returns an empty
     * page when the caller has no reports or is not an employee.
     */
    static async getMyReports(params?: {
        page?: number;
        limit?: number;
    }): Promise<EmployeeListResponse> {
        const path = buildApiPath("/employees/me/reports", {
            page: params?.page,
            limit: params?.limit,
        });
        return apiClient.get<EmployeeListResponse>(path);
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
        employeeData: CreateEmployeeDto,
    ): Promise<{ message: string; employee: EmployeeWithUser }> {
        return apiClient.post<{ message: string; employee: EmployeeWithUser }>(
            "/employees",
            employeeData,
        );
    }

    /**
     * Update an employee
     */
    static async updateEmployee(
        id: string,
        employeeData: UpdateEmployeeDto,
    ): Promise<{ message: string; employee: EmployeeWithUser }> {
        return apiClient.patch<{ message: string; employee: EmployeeWithUser }>(
            `/employees/${id}`,
            employeeData,
        );
    }

    /**
     * Delete (deactivate) an employee
     */
    static async deleteEmployee(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/employees/${id}`);
    }

    /**
     * Complete employee onboarding with activation token
     * Public endpoint - no auth required
     */
    static async completeOnboarding(
        data: CompleteEmployeeOnboardingDto,
    ): Promise<{ message: string; userId: string; email: string }> {
        return apiClient.post<{
            message: string;
            userId: string;
            email: string;
        }>("/employees/onboard", data);
    }
}
