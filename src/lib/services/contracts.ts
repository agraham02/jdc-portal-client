/**
 * Contracts API Service
 * Aligned with CONTRACTS_FRONTEND_GUIDE.md and backend API
 */

import { apiClient } from "../api";
import type {
    Contract,
    Application,
    ContractListResponse,
    ApplicationListResponse,
    InternalNoteListResponse,
    CreateContractDto,
    UpdateContractDto,
    ApplyToContractDto,
    UpdateApplicationStatusDto,
    AwardContractDto,
    CreateInternalNoteDto,
    UpdateInternalNoteDto,
    ContractFilterParams,
    ApplicationFilterParams,
    InternalNoteFilterParams,
    ApplicationResponse,
    ContractResponse,
    DocumentsUploadResponse,
    InternalNoteResponse,
    FileDocument,
} from "../types/contracts";

// ============================================================================
// Contracts
// ============================================================================

export class ContractsService {
    /**
     * List all contracts with pagination and filtering
     */
    static async listContracts(
        params?: ContractFilterParams
    ): Promise<ContractListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.status) queryParams.append("status", params.status);
        if (params?.search) queryParams.append("search", params.search);
        if (params?.createdBy)
            queryParams.append("createdBy", params.createdBy);

        const query = queryParams.toString();
        return apiClient.get<ContractListResponse>(
            `/contracts${query ? `?${query}` : ""}`
        );
    }

    /**
     * Get contract by ID (staff view - includes applications)
     */
    static async getContract(id: string): Promise<Contract> {
        return apiClient.get<Contract>(`/contracts/${id}`);
    }

    /**
     * Get public contract by ID (vendor view - open contracts only)
     */
    static async getPublicContract(id: string): Promise<Contract> {
        return apiClient.get<Contract>(`/contracts/public/${id}`);
    }

    /**
     * Create a new contract (creates in Draft status)
     * @param data Contract data
     * @param files Optional array of files to upload with the contract (max 5 files, 5MB each)
     */
    static async createContract(
        data: CreateContractDto,
        files?: File[]
    ): Promise<Contract> {
        // If files are provided, use FormData
        if (files && files.length > 0) {
            const formData = new FormData();

            // Append contract data as JSON
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (typeof value === "object") {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            // Append files
            files.forEach((file) => {
                formData.append("files", file);
            });

            return apiClient.postFormData<Contract>("/contracts", formData);
        }

        // Otherwise use regular JSON
        return apiClient.post<Contract>("/contracts", data);
    }

    /**
     * Update a draft contract (only works on Draft status)
     */
    static async updateContract(
        id: string,
        data: UpdateContractDto
    ): Promise<Contract> {
        return apiClient.patch<Contract>(`/contracts/${id}`, data);
    }

    /**
     * Publish a contract (Draft → Open)
     */
    static async openContract(id: string): Promise<ContractResponse> {
        return apiClient.patch<ContractResponse>(`/contracts/${id}/open`, {});
    }

    /**
     * Close a contract (Open → Closed, stops accepting applications)
     */
    static async closeContract(id: string): Promise<ContractResponse> {
        return apiClient.patch<ContractResponse>(`/contracts/${id}/close`, {});
    }

    /**
     * Award a contract (Open → Awarded, selects winner)
     */
    static async awardContract(
        id: string,
        data: AwardContractDto
    ): Promise<ContractResponse> {
        return apiClient.post<ContractResponse>(`/contracts/${id}/award`, data);
    }

    /**
     * Delete a contract (cannot delete Awarded contracts)
     */
    static async deleteContract(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/contracts/${id}`);
    }

    /**
     * Upload documents to a draft contract
     * @param files Array of File objects (max 20 files, 100MB each)
     */
    static async uploadDocuments(
        id: string,
        files: File[]
    ): Promise<DocumentsUploadResponse> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files[]", file);
        });
        return apiClient.postFormData<DocumentsUploadResponse>(
            `/contracts/${id}/documents`,
            formData
        );
    }

    /**
     * Replace a document in a draft contract
     */
    static async replaceDocument(
        id: string,
        fileId: string,
        file: File
    ): Promise<FileDocument> {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.patch<FileDocument>(
            `/contracts/${id}/documents/${fileId}`,
            formData
        );
    }

    /**
     * Delete a document from a draft contract
     */
    static async deleteDocument(
        id: string,
        fileId: string
    ): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(
            `/contracts/${id}/documents/${fileId}`
        );
    }
}

// ============================================================================
// Applications
// ============================================================================

export class ApplicationsService {
    /**
     * Submit an application to a contract
     * @param contractId Contract ID
     * @param data Application details
     * @param documents Required documents (File objects)
     */
    static async submitApplication(
        contractId: string,
        data: ApplyToContractDto,
        documents: File[]
    ): Promise<ApplicationResponse> {
        const formData = new FormData();
        formData.append("proposalDetails", data.proposalDetails);
        documents.forEach((file) => {
            formData.append("files", file);
        });
        return apiClient.postFormData<ApplicationResponse>(
            `/contracts/${contractId}/apply`,
            formData
        );
    }

    /**
     * List applications for a contract
     */
    static async listApplications(
        contractId: string,
        params?: ApplicationFilterParams
    ): Promise<ApplicationListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.status) queryParams.append("status", params.status);

        const query = queryParams.toString();
        return apiClient.get<ApplicationListResponse>(
            `/contracts/${contractId}/applications${query ? `?${query}` : ""}`
        );
    }

    /**
     * Get a specific application
     */
    static async getApplication(
        contractId: string,
        applicationId: string
    ): Promise<Application> {
        return apiClient.get<Application>(
            `/contracts/${contractId}/applications/${applicationId}`
        );
    }

    /**
     * Update application status (staff only)
     */
    static async updateApplicationStatus(
        contractId: string,
        applicationId: string,
        data: UpdateApplicationStatusDto
    ): Promise<ApplicationResponse> {
        return apiClient.patch<ApplicationResponse>(
            `/contracts/${contractId}/applications/${applicationId}/status`,
            data
        );
    }

    /**
     * Withdraw an application (vendor self-service)
     */
    static async withdrawApplication(
        contractId: string,
        applicationId: string
    ): Promise<ApplicationResponse> {
        return apiClient.post<ApplicationResponse>(
            `/contracts/${contractId}/applications/${applicationId}/withdraw`,
            {}
        );
    }

    /**
     * Cancel an application (admin only, requires reason)
     */
    static async cancelApplication(
        contractId: string,
        applicationId: string,
        reason: string
    ): Promise<ApplicationResponse> {
        return apiClient.post<ApplicationResponse>(
            `/contracts/${contractId}/applications/${applicationId}/cancel`,
            { reason }
        );
    }

    /**
     * Check if vendor has already applied to a contract
     */
    static async checkApplication(
        contractId: string
    ): Promise<{ hasApplied: boolean; applicationId?: string }> {
        return apiClient.get<{ hasApplied: boolean; applicationId?: string }>(
            `/contracts/${contractId}/check-application`
        );
    }

    /**
     * Get vendor's own applications (across all contracts)
     */
    static async getMyApplications(
        params?: ApplicationFilterParams
    ): Promise<ApplicationListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.status) queryParams.append("status", params.status);

        const query = queryParams.toString();
        return apiClient.get<ApplicationListResponse>(
            `/contracts/my-applications${query ? `?${query}` : ""}`
        );
    }

    /**
     * Get applications inbox (staff only - all pending applications)
     */
    static async getApplicationsInbox(
        params?: ApplicationFilterParams
    ): Promise<ApplicationListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.status) queryParams.append("status", params.status);

        const query = queryParams.toString();
        return apiClient.get<ApplicationListResponse>(
            `/contracts/applications-inbox${query ? `?${query}` : ""}`
        );
    }
}

// ============================================================================
// Internal Notes
// ============================================================================

export class InternalNotesService {
    /**
     * List internal notes for a contract
     */
    static async listNotes(
        contractId: string,
        params?: InternalNoteFilterParams
    ): Promise<InternalNoteListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.applicationId)
            queryParams.append("applicationId", params.applicationId);

        const query = queryParams.toString();
        return apiClient.get<InternalNoteListResponse>(
            `/contracts/${contractId}/notes${query ? `?${query}` : ""}`
        );
    }

    /**
     * Create an internal note
     */
    static async createNote(
        contractId: string,
        data: CreateInternalNoteDto
    ): Promise<InternalNoteResponse> {
        return apiClient.post<InternalNoteResponse>(
            `/contracts/${contractId}/notes`,
            data
        );
    }

    /**
     * Update an internal note (author only)
     */
    static async updateNote(
        contractId: string,
        noteId: string,
        data: UpdateInternalNoteDto
    ): Promise<InternalNoteResponse> {
        return apiClient.patch<InternalNoteResponse>(
            `/contracts/${contractId}/notes/${noteId}`,
            data
        );
    }

    /**
     * Delete an internal note (author only)
     */
    static async deleteNote(
        contractId: string,
        noteId: string
    ): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(
            `/contracts/${contractId}/notes/${noteId}`
        );
    }
}
