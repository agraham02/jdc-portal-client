import { PaginatedResponse } from "./api";

export enum ContractStatus {
    DRAFT = "draft",
    OPEN = "open",
    CLOSED = "closed",
    AWARDED = "awarded",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export enum ApplicationStatus {
    SUBMITTED = "submitted",
    IN_REVIEW = "in_review",
    AWARDED = "awarded",
    REJECTED = "rejected",
}

export interface ContractApplication {
    _id: string;
    contractId: string;
    vendorId: string;
    vendorName?: string;
    applicationDate: string; // ISO date string
    proposalDetails: string;
    status: ApplicationStatus;
    documents?: string[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Contract {
    _id: string;
    title: string;
    description: string;
    status: ContractStatus;
    budget?: number;
    deadline?: string; // ISO date string
    requiredDocuments?: string[];
    createdBy: {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName: string;
        email: string;
    };
    awardedToVendorId?: string;
    awardedToVendorName?: string;
    applications?: ContractApplication[];
    applicationCount?: number;
    documents?: string[];
    createdAt: string;
    updatedAt: string;
}

// DTOs matching the new API
export interface CreateContractDto {
    title: string;
    description: string;
    budget?: number;
    deadline?: string; // ISO date string
    requiredDocuments?: string[];
}

export interface UpdateContractDto {
    title?: string;
    description?: string;
    budget?: number;
    deadline?: string; // ISO date string
    requiredDocuments?: string[];
}

export interface ApplyToContractDto {
    proposalDetails: string;
}

export interface UpdateApplicationStatusDto {
    status: ApplicationStatus;
    notes?: string;
}

export interface AwardContractDto {
    applicationId: string;
    notes?: string;
}

// Response types
export type ContractListResponse = PaginatedResponse<Contract>;

export interface ContractApplicationsResponse
    extends PaginatedResponse<ContractApplication> {
    contract: Contract;
}
