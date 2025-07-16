export enum ContractStatus {
    OPEN = "Open",
    IN_PROGRESS = "InProgress",
    CLOSED = "Closed",
    AWARDED = "Awarded",
}

export enum ContractApplicationStatus {
    SUBMITTED = "Submitted",
    REVIEWED = "Reviewed",
    ACCEPTED = "Accepted",
    REJECTED = "Rejected",
}

export interface ContractApplication {
    _id?: string;
    vendorId: string;
    userId: string;
    applicationDate: Date;
    proposalDetails: string;
    status: ContractApplicationStatus;
    documents?: string[];
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Contract {
    _id: string;
    title: string;
    description: string;
    status: ContractStatus;
    budget?: number;
    deadline?: Date;
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    awardedToVendorId?: string;
    applications: ContractApplication[];
    documents?: string[];
    statusLog?: Array<{
        status: ContractStatus;
        changedAt: Date;
        changedBy: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateContractRequest {
    title: string;
    description: string;
    budget?: number;
    deadline?: string;
    documents?: string[];
}

export interface UpdateContractRequest {
    title?: string;
    description?: string;
    budget?: number;
    deadline?: string;
    documents?: string[];
}

export interface ApplyToContractRequest {
    proposalDetails: string;
    documents?: string[];
}

export interface UpdateApplicationStatusRequest {
    status: ContractApplicationStatus;
    notes?: string;
}

export interface AwardContractRequest {
    applicationId: string;
    notes?: string;
}

export interface ContractListResponse {
    data: Contract[];
    total: number;
    page: number;
    limit: number;
}

export interface ContractResponse {
    message: string;
    contract: Contract;
}
