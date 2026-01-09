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
    ACCEPTED = "Accepted", // Application passed review, in consideration
    REJECTED = "Rejected",
    WITHDRAWN = "Withdrawn",
    CANCELLED = "Cancelled",
    AWARDED = "Awarded", // This application won the contract
}

/**
 * Review status values that can be set via updateApplicationStatus API
 * This is a subset of ApplicationStatus - only these values are valid for status updates
 */
export enum ReviewStatus {
    REVIEWED = "Reviewed",
    ACCEPTED = "Accepted",
    REJECTED = "Rejected",
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
    originalName: string; // Matches backend FILE_PUBLIC_FIELDS
    filename?: string; // Legacy field - prefer originalName
    mimetype: string;
    size: number;
    createdAt: string; // ISO date string from timestamps
    updatedAt?: string;
}

/**
 * Minimal user info returned from populated fields
 */
export interface UserMinimal {
    _id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email: string;
}

/**
 * Minimal vendor info returned from populated fields
 * Vendors have different fields than regular users
 */
export interface VendorMinimal {
    _id: string;
    companyName?: string;
    contactName?: string;
    servicesOffered?: string;
    email?: string;
}

/**
 * Minimal contract info when populated in applications
 */
export interface ContractMinimal {
    _id: string;
    title: string;
    status: ContractStatus;
    deadline?: string;
}

/**
 * @deprecated Use UserMinimal instead
 */
export interface User extends UserMinimal {}

/**
 * @deprecated Use VendorMinimal instead
 */
export interface Vendor extends UserMinimal {
    companyName?: string;
    phoneNumber?: string;
}

export interface Application {
    _id: string;
    /**
     * Contract ID - may be a string or populated ContractMinimal object
     * Use getContractId() helper to safely extract the ID
     */
    contractId: string | ContractMinimal;
    vendorId: string;
    userId: string; // The user who submitted the application
    vendor?: VendorMinimal;
    user?: UserMinimal; // Populated user info
    /**
     * @deprecated Use contractId when it's populated instead
     * Backend populates contractId directly, not a separate contract field
     */
    contract?: ContractMinimal;
    proposalDetails?: string; // Proposal text (matches API)
    proposedBudget?: number; // The vendor's proposed budget
    status: ApplicationStatus;
    documents: FileDocument[];
    applicationDate: string; // ISO date string - when application was submitted (matches API)
    statusHistory: ApplicationStatusHistory[];
    // Withdrawal tracking (vendor-initiated)
    withdrawnAt?: string | null;
    withdrawnBy?: string | null;
    withdrawalReason?: string | null;
    // Cancellation tracking (admin-initiated)
    cancelledAt?: string | null;
    cancelledBy?: string | null;
    cancellationReason?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationStatusHistory {
    previousStatus: ApplicationStatus;
    newStatus: ApplicationStatus;
    changedAt: string;
    changedBy: string;
    comments?: string;
}

export interface Contract {
    _id: string;
    title: string;
    description: string;
    status: ContractStatus;
    budget?: number;
    currency?: string; // e.g., "USD"
    deadline?: string; // ISO date string
    requiresResponsiveSupport?: boolean;
    requiredDocuments?: RequiredDocument[]; // Optional with default []
    documents?: FileDocument[]; // Contract-level documents
    createdBy: User;
    openedAt?: string | null; // When contract was opened for applications
    closedAt?: string | null; // When contract was closed (terminal state)
    awardedAt?: string | null; // When contract was awarded
    awardedToVendorId?: string | null; // Vendor ID who won the contract
    awardedApplicationId?: string | null; // Winning application ID
    awardedVendor?: Vendor | null; // Populated vendor info
    awardedApplication?: Application | null; // Populated application info
    applicationCount?: number; // Number of applications (for list views)
    createdAt: string;
    updatedAt: string;
}

export interface InternalNote {
    _id: string;
    contractId: string;
    applicationId?: string | null;
    content: string;
    createdBy: User; // API returns createdBy, not author
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
    proposal?: string; // Proposal text
    proposedBudget?: number; // The vendor's proposed budget
    // Documents are uploaded via multipart/form-data, not JSON
}

/**
 * DTO for updating application status
 * Only ReviewStatus values are valid for status updates
 */
export interface UpdateApplicationStatusDto {
    status: ReviewStatus;
    /** Optional comments for the status change (e.g., rejection reason) */
    comments?: string;
}

export interface AwardContractDto {
    applicationId: string; // Award contract to the vendor who submitted this application
}

export interface CreateInternalNoteDto {
    content: string;
    applicationId?: string; // Optional - links note to specific application
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
    contractId?: string;
}

export interface VendorApplicationFilterParams {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    contractId?: string;
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Type guard to check if contractId is a populated ContractMinimal object
 */
export function isPopulatedContract(
    contractId: string | ContractMinimal | undefined | null
): contractId is ContractMinimal {
    return (
        typeof contractId === "object" &&
        contractId !== null &&
        "_id" in contractId
    );
}

/**
 * Safely extract the contract ID from an application
 * Handles both string IDs and populated ContractMinimal objects
 */
export function getContractId(application: Application): string {
    if (isPopulatedContract(application.contractId)) {
        return application.contractId._id;
    }
    // Handle legacy contract field if contractId is not populated
    if (
        typeof application.contractId === "string" &&
        application.contractId === "" &&
        application.contract
    ) {
        return application.contract._id;
    }
    return application.contractId as string;
}

/**
 * Get the contract title from an application
 * Handles both populated contractId and legacy contract field
 */
export function getContractTitle(application: Application): string {
    if (isPopulatedContract(application.contractId)) {
        return application.contractId.title;
    }
    if (application.contract?.title) {
        return application.contract.title;
    }
    return "Unknown Contract";
}

/**
 * Get the contract status from an application
 * Handles both populated contractId and legacy contract field
 */
export function getContractStatus(
    application: Application
): ContractStatus | undefined {
    if (isPopulatedContract(application.contractId)) {
        return application.contractId.status;
    }
    return application.contract?.status;
}

/**
 * Get the contract deadline from an application
 */
export function getContractDeadline(
    application: Application
): string | undefined {
    if (isPopulatedContract(application.contractId)) {
        return application.contractId.deadline;
    }
    return application.contract?.deadline;
}

/**
 * Get the display name for a vendor
 * Handles VendorMinimal with companyName/contactName
 */
export function getVendorDisplayName(
    vendor: VendorMinimal | undefined
): string {
    if (!vendor) return "Unknown Vendor";
    return vendor.companyName || vendor.contactName || "Unknown Vendor";
}

/**
 * Get the filename from a FileDocument
 * Handles both originalName and legacy filename field
 */
export function getDocumentFilename(doc: FileDocument): string {
    return doc.originalName || doc.filename || "Unknown File";
}
