import { apiClient } from "../api";
import {
    Contract,
    ContractListResponse,
    ContractResponse,
    CreateContractRequest,
    UpdateContractRequest,
    ApplyToContractRequest,
    UpdateApplicationStatusRequest,
    AwardContractRequest,
    ContractStatus,
} from "../types/contract";

export const contractService = {
    // Get all contracts with pagination and filtering
    async getContracts(params?: {
        page?: number;
        limit?: number;
        status?: ContractStatus;
    }): Promise<ContractListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.status) queryParams.append("status", params.status);

        return await apiClient.get<ContractListResponse>(
            `/contracts?${queryParams.toString()}`
        );
    },

    // Get active/open contracts
    async getActiveContracts(): Promise<ContractListResponse> {
        return apiClient.get<ContractListResponse>("/contracts/active");
    },

    // Get vendor's applications
    async getMyApplications(params?: {
        page?: number;
        limit?: number;
    }): Promise<ContractListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        return await apiClient.get<ContractListResponse>(
            `/contracts/my-applications?${queryParams.toString()}`
        );
    },

    // Get contract by ID
    async getContract(id: string): Promise<Contract> {
        return await apiClient.get<Contract>(`/contracts/${id}`);
    },

    // Create new contract (Admin only)
    async createContract(
        data: CreateContractRequest,
        files?: File[]
    ): Promise<ContractResponse> {
        const formData = new FormData();

        // Append text fields
        formData.append("title", data.title);
        formData.append("description", data.description);
        if (data.budget !== undefined) {
            formData.append("budget", data.budget.toString());
        }
        if (data.deadline) {
            formData.append("deadline", data.deadline);
        }

        // Append files
        if (files) {
            files.forEach((file) => {
                formData.append("files", file);
            });
        }

        return await apiClient.postFormData<ContractResponse>(
            "/contracts",
            formData
        );
    },

    // Update contract (Admin only)
    async updateContract(
        id: string,
        data: UpdateContractRequest
    ): Promise<ContractResponse> {
        return await apiClient.patch<ContractResponse>(
            `/contracts/${id}`,
            data
        );
    },

    // Apply to contract (Vendor only)
    async applyToContract(
        id: string,
        data: ApplyToContractRequest,
        files?: File[]
    ): Promise<ContractResponse> {
        const formData = new FormData();

        formData.append("proposalDetails", data.proposalDetails);

        // Append files
        if (files) {
            files.forEach((file) => {
                formData.append("files", file);
            });
        }

        return await apiClient.postFormData<ContractResponse>(
            `/contracts/${id}/apply`,
            formData
        );
    },

    // Update application status (Admin only)
    async updateApplicationStatus(
        contractId: string,
        applicationId: string,
        data: UpdateApplicationStatusRequest
    ): Promise<ContractResponse> {
        return await apiClient.patch<ContractResponse>(
            `/contracts/${contractId}/applications/${applicationId}/status`,
            data
        );
    },

    // Award contract (Admin only)
    async awardContract(
        id: string,
        data: AwardContractRequest
    ): Promise<ContractResponse> {
        return await apiClient.post<ContractResponse>(
            `/contracts/${id}/award`,
            data
        );
    },

    // Close contract (Admin only)
    async closeContract(id: string): Promise<ContractResponse> {
        return await apiClient.patch<ContractResponse>(
            `/contracts/${id}/close`,
            {}
        );
    },

    // Delete contract (Admin only)
    async deleteContract(id: string): Promise<{ message: string }> {
        return await apiClient.delete<{ message: string }>(`/contracts/${id}`);
    },
};
