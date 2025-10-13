import { z } from "zod";
import { addressSchema } from "./auth";

/**
 * Vendor Validation Schemas
 * Aligned with backend DTOs in vendors/dto.ts
 */

// Phone regex matching backend: E.164 format
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// Update Vendor Schema (for existing vendors)
export const updateVendorSchema = z.object({
    companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(100, "Company name must not exceed 100 characters")
        .trim()
        .optional(),
    website: z
        .string()
        .url("Invalid website URL")
        .optional()
        .or(z.literal("")),
    contactName: z
        .string()
        .max(50, "Contact name must not exceed 50 characters")
        .trim()
        .optional(),
    contactEmail: z
        .string()
        .email("Invalid contact email")
        .max(50, "Contact email must not exceed 50 characters")
        .trim()
        .optional(),
    contactPhone: z
        .string()
        .min(7, "Phone number must be at least 7 characters")
        .max(15, "Phone number must not exceed 15 characters")
        .regex(phoneRegex, "Please provide a valid phone number in E.164 format (e.g., +12345678901)")
        .trim()
        .optional()
        .or(z.literal("")),
    servicesOffered: z
        .array(z.string())
        .optional(),
    notes: z
        .string()
        .max(500, "Notes must not exceed 500 characters")
        .trim()
        .optional(),
    physicalAddress: addressSchema.optional(),
    mailingAddress: addressSchema.optional(),
});

// Vendor List Query Schema
export const vendorListQuerySchema = z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    status: z.enum(["Active", "Pending", "Inactive", "Rejected"]).optional(),
    servicesOffered: z.string().trim().optional(),
});

// Type exports
export type UpdateVendorFormData = z.infer<typeof updateVendorSchema>;
export type VendorListQueryFormData = z.infer<typeof vendorListQuerySchema>;
