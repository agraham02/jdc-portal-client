import { apiClient } from "../api";
import {
    Contract,
    ContractListResponse,
    CreateContractDto,
    UpdateContractDto,
    // ApplyToContractDto,
    UpdateApplicationStatusDto,
    AwardContractDto,
    ContractStatus,
    ContractApplicationsResponse,
    ContractApplication,
} from "../types/contract";
import { BaseFilterParams } from "../types/api";

interface ContractFilterParams extends BaseFilterParams {
    status?: ContractStatus;
    createdBy?: string;
}

export const contractService = {
    // Get all contracts with pagination and filtering
    async getContracts(
        params?: ContractFilterParams
    ): Promise<ContractListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.status) queryParams.append("status", params.status);
        if (params?.search) queryParams.append("search", params.search);
        if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params?.sortOrder)
            queryParams.append("sortOrder", params.sortOrder);

        const query = queryParams.toString();
        return await apiClient.get<ContractListResponse>(
            `/contracts${query ? `?${query}` : ""}`
        );
    },

    // Get active/open contracts
    async getActiveContracts(
        params?: BaseFilterParams
    ): Promise<ContractListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.search) queryParams.append("search", params.search);

        const query = queryParams.toString();
        return apiClient.get<ContractListResponse>(
            `/contracts/active${query ? `?${query}` : ""}`
        );
    },

    // Get vendor's applications
    async getMyApplications(
        params?: BaseFilterParams
    ): Promise<ContractListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.search) queryParams.append("search", params.search);

        const query = queryParams.toString();
        return await apiClient.get<ContractListResponse>(
            `/contracts/my-applications${query ? `?${query}` : ""}`
        );
    },

    // Get applications inbox (Admin only)
    async getApplicationsInbox(
        params?: BaseFilterParams
    ): Promise<ContractApplicationsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.search) queryParams.append("search", params.search);

        const query = queryParams.toString();
        return await apiClient.get<ContractApplicationsResponse>(
            `/contracts/applications-inbox${query ? `?${query}` : ""}`
        );
    },

    // Get contract by ID
    async getContract(id: string): Promise<Contract> {
        return await apiClient.get<Contract>(`/contracts/${id}`);
    },

    // Get public contract by ID (for vendors to view)
    async getPublicContract(id: string): Promise<Contract> {
        return await apiClient.get<Contract>(`/contracts/public/${id}`);
    },

    // Create new contract (Admin/Employee only)
    // Accepts either a DTO or FormData for file uploads
    async createContract(
        data: CreateContractDto | FormData
    ): Promise<Contract> {
        // If FormData, send as multipart/form-data
        if (data instanceof FormData) {
            return await apiClient.post<Contract>("/contracts", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }
        // Otherwise, send as JSON
        return await apiClient.post<Contract>("/contracts", data);
    },

    // Update contract (Admin/Employee only)
    async updateContract(
        id: string,
        data: UpdateContractDto
    ): Promise<Contract> {
        return await apiClient.patch<Contract>(`/contracts/${id}`, data);
    },

    // Open a draft contract (Admin/Employee only)
    async openContract(id: string): Promise<Contract> {
        return await apiClient.patch<Contract>(`/contracts/${id}/open`, {});
    },

    // Check if vendor has already applied to this contract
    async checkApplication(
        id: string
    ): Promise<{ hasApplied: boolean; applicationId?: string }> {
        return await apiClient.get<{
            hasApplied: boolean;
            applicationId?: string;
        }>(`/contracts/${id}/check-application`);
    },
    // Apply to contract (Vendor only) with file upload support
    async applyToContract(
        id: string,
        formData: FormData
    ): Promise<{ application: ContractApplication }> {
        return await apiClient.post<{ application: ContractApplication }>(
            `/contracts/${id}/apply`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    },

    // Get applications for a specific contract (Admin/Employee only)
    async getContractApplications(
        id: string,
        params?: BaseFilterParams
    ): Promise<ContractApplicationsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        const query = queryParams.toString();
        return await apiClient.get<ContractApplicationsResponse>(
            `/contracts/${id}/applications${query ? `?${query}` : ""}`
        );
    },

    // Update application status (Admin only)
    async updateApplicationStatus(
        contractId: string,
        applicationId: string,
        data: UpdateApplicationStatusDto
    ): Promise<{ application: ContractApplication }> {
        return await apiClient.patch<{ application: ContractApplication }>(
            `/contracts/${contractId}/applications/${applicationId}/status`,
            data
        );
    },

    // Award contract (Admin only)
    async awardContract(id: string, data: AwardContractDto): Promise<Contract> {
        return await apiClient.post<Contract>(`/contracts/${id}/award`, data);
    },

    // Delete contract (Admin only)
    async deleteContract(id: string): Promise<{ message: string }> {
        return await apiClient.delete<{ message: string }>(`/contracts/${id}`);
    },
};
