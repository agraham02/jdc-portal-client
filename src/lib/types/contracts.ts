/**
 * Contract & Application Types
 * Aligned with CONTRACTS_FRONTEND_GUIDE.md and backend API
 */

import { PaginatedResponse } from "./api";

// ============================================================================
// Enums
// ============================================================================

export enum ContractStatus {
    DRAFT = "Draft",
    OPEN = "Open",
    CLOSED = "Closed",
    AWARDED = "Awarded",
}

export enum ApplicationStatus {
    SUBMITTED = "Submitted",
    REVIEWED = "Reviewed",
    ACCEPTED = "Accepted",
    REJECTED = "Rejected",
    WITHDRAWN = "Withdrawn",
    CANCELLED = "Cancelled",
}

// ============================================================================
// Core Models
// ============================================================================

export interface RequiredDocument {
    name: string;
    description: string;
    required: boolean;
}

export interface FileDocument {
    _id: string;
    filename: string;
    mimetype: string;
    size: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface User {
    _id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email: string;
}

export interface Vendor extends User {
    companyName?: string;
    phoneNumber?: string;
}

export interface Application {
    _id: string;
    contractId: string;
    vendorId: string;
    vendor?: Vendor;
    proposalDetails: string;
    bidValue?: number;
    status: ApplicationStatus;
    documents: FileDocument[];
    applicationDate: string; // ISO date string - when application was submitted
    submittedAt?: string; // Alias for applicationDate (for backwards compatibility)
    reviewedAt?: string | null;
    acceptedAt?: string | null;
    rejectedAt?: string | null;
    withdrawnAt?: string | null;
    withdrawnBy?: string | null;
    cancelledAt?: string | null;
    cancelledBy?: string | null;
    cancellationReason?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Contract {
    _id: string;
    title: string;
    description: string;
    status: ContractStatus;
    budget?: number;
    currency?: string; // e.g., "USD"
    deadline?: string; // ISO date string
    requiresResponsiveSupport: boolean;
    requiredDocuments?: RequiredDocument[]; // Optional with default []
    documents?: FileDocument[]; // Optional with default []
    createdBy: User;
    openedAt?: string | null; // ISO date string
    closedAt?: string | null;
    awardedAt?: string | null;
    awardedApplication?: string | null; // Application ID
    applications?: Application[]; // Only populated for staff with permissions
    createdAt: string;
    updatedAt: string;
}

export interface InternalNote {
    _id: string;
    contractId: string;
    applicationId?: string | null;
    content: string;
    author: User;
    authorId: string;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateContractDto {
    title: string;
    description: string;
    budget?: number;
    currency?: string;
    deadline?: string; // ISO date string
    requiresResponsiveSupport?: boolean;
    requiredDocuments?: RequiredDocument[];
}

export interface UpdateContractDto {
    title?: string;
    description?: string;
    budget?: number;
    currency?: string;
    deadline?: string;
    requiresResponsiveSupport?: boolean;
    requiredDocuments?: RequiredDocument[];
}

export interface ApplyToContractDto {
    proposalDetails: string;
    bidValue?: number;
    // Documents are uploaded via multipart/form-data, not JSON
}

export interface UpdateApplicationStatusDto {
    status: ApplicationStatus;
}

export interface AwardContractDto {
    applicationId: string;
}

export interface CreateInternalNoteDto {
    content: string;
    applicationId?: string; // Optional - links note to specific application
}

export interface UpdateInternalNoteDto {
    content: string;
}

// ============================================================================
// Response Types
// ============================================================================

export type ContractListResponse = PaginatedResponse<Contract>;
export type ApplicationListResponse = PaginatedResponse<Application>;
export type InternalNoteListResponse = PaginatedResponse<InternalNote>;

export interface ApplicationResponse {
    message: string;
    application: Application;
}

export interface ContractResponse {
    message: string;
    contract: Contract;
}

export interface DocumentsUploadResponse {
    message: string;
    documents: FileDocument[];
}

export interface InternalNoteResponse {
    message: string;
    note: InternalNote;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface ContractFilterParams {
    page?: number;
    limit?: number;
    status?: ContractStatus;
    search?: string;
    createdBy?: string;
}

export interface ApplicationFilterParams {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
}

export interface InternalNoteFilterParams {
    page?: number;
    limit?: number;
    applicationId?: string;
}

// ============================================================================
// Helper Types
// ============================================================================

export type ContractAction =
    | "edit"
    | "publish"
    | "close"
    | "award"
    | "delete"
    | "uploadDocuments"
    | "deleteDocument";

export type ApplicationAction =
    | "submit"
    | "review"
    | "accept"
    | "reject"
    | "withdraw"
    | "cancel";

// ============================================================================
// Validation Constants
// ============================================================================

export const CONTRACT_FILE_VALIDATION = {
    maxSizeMB: 5, // Match backend multer config (5MB per file)
    maxFiles: 10, // Match backend multer config (10 files max)
    allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/zip",
    ],
    allowedExtensions: [
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".txt",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".zip",
    ],
};

export const APPLICATION_FILE_VALIDATION = {
    ...CONTRACT_FILE_VALIDATION,
};

// Export as FILE_VALIDATION_RULES for backwards compatibility
export const FILE_VALIDATION_RULES = CONTRACT_FILE_VALIDATION;
