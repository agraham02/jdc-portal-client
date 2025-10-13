import { z } from "zod";

/**
 * Contract Validation Schemas
 * Aligned with backend DTOs in contracts/dto.ts
 */

// Required Document schema
export const requiredDocumentSchema = z.object({
    name: z
        .string()
        .min(2, "Document name must be at least 2 characters")
        .max(100, "Document name must not exceed 100 characters")
        .trim(),
    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .trim()
        .optional(),
    required: z.boolean(),
});

// Create Contract Schema
export const createContractSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title must not exceed 100 characters")
        .trim(),
    description: z
        .string()
        .min(5, "Description must be at least 5 characters")
        .max(1000, "Description must not exceed 1000 characters")
        .trim(),
    budget: z
        .number()
        .min(0, "Budget must be non-negative")
        .optional(),
    currency: z
        .string()
        .length(3, "Currency code must be exactly 3 characters")
        .toUpperCase()
        .optional(),
    deadline: z
        .string()
        .datetime("Invalid date format")
        .optional(),
    requiresResponsiveSupport: z.boolean().optional(),
    requiredDocuments: z
        .array(requiredDocumentSchema)
        .max(10, "Maximum 10 required documents allowed")
        .optional(),
});

// Update Contract Schema (all fields optional)
export const updateContractSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title must not exceed 100 characters")
        .trim()
        .optional(),
    description: z
        .string()
        .min(5, "Description must be at least 5 characters")
        .max(1000, "Description must not exceed 1000 characters")
        .trim()
        .optional(),
    budget: z
        .number()
        .min(0, "Budget must be non-negative")
        .optional(),
    currency: z
        .string()
        .length(3, "Currency code must be exactly 3 characters")
        .toUpperCase()
        .optional(),
    deadline: z
        .string()
        .datetime("Invalid date format")
        .optional(),
    requiresResponsiveSupport: z.boolean().optional(),
    requiredDocuments: z
        .array(requiredDocumentSchema)
        .max(10, "Maximum 10 required documents allowed")
        .optional(),
});

// Apply to Contract Schema (Vendor Application)
export const applyToContractSchema = z.object({
    proposalDetails: z
        .string()
        .min(10, "Proposal must be at least 10 characters")
        .max(5000, "Proposal must not exceed 5000 characters")
        .trim()
        .optional(),
    bidValue: z
        .number()
        .min(0, "Bid value must be non-negative")
        .optional(),
});

// Update Application Status Schema
export const updateApplicationStatusSchema = z.object({
    status: z.enum(["Submitted", "Reviewed", "Accepted", "Rejected"], {
        errorMap: () => ({ message: "Invalid application status" }),
    }),
    notes: z
        .string()
        .max(1000, "Notes must not exceed 1000 characters")
        .trim()
        .optional(),
});

// Award Contract Schema
export const awardContractSchema = z.object({
    vendorId: z.string().min(1, "Vendor ID is required"),
    notes: z
        .string()
        .max(1000, "Notes must not exceed 1000 characters")
        .trim()
        .optional(),
});

// Contract List Query Schema
export const contractListQuerySchema = z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
    status: z
        .enum(["Draft", "Open", "Awarded", "Closed", "Cancelled"])
        .optional(),
    search: z.string().trim().optional(),
});

// Application List Query Schema
export const applicationListQuerySchema = z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
    status: z
        .enum(["Submitted", "Reviewed", "Accepted", "Rejected"])
        .optional(),
    contractId: z.string().optional(),
});

// File validation constants (matching backend)
export const CONTRACT_FILE_VALIDATION = {
    maxSizeMB: 5,
    maxFiles: 5,
    allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
    ],
};

export const APPLICATION_FILE_VALIDATION = {
    maxSizeMB: 5,
    maxFiles: 10,
    allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
    ],
};

// Type exports
export type RequiredDocumentFormData = z.infer<typeof requiredDocumentSchema>;
export type CreateContractFormData = z.infer<typeof createContractSchema>;
export type UpdateContractFormData = z.infer<typeof updateContractSchema>;
export type ApplyToContractFormData = z.infer<typeof applyToContractSchema>;
export type UpdateApplicationStatusFormData = z.infer<
    typeof updateApplicationStatusSchema
>;
export type AwardContractFormData = z.infer<typeof awardContractSchema>;
export type ContractListQueryFormData = z.infer<
    typeof contractListQuerySchema
>;
export type ApplicationListQueryFormData = z.infer<
    typeof applicationListQuerySchema
>;
