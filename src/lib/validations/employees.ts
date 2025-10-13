import { z } from "zod";

/**
 * Employee Validation Schemas
 * Aligned with backend DTOs in employees/dto.ts
 */

// Phone regex matching backend: E.164 format
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// Create Employee Schema (for admin creating employees)
export const createEmployeeSchema = z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    employeeId: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    contactPhone: z
        .string()
        .min(7, "Phone number must be at least 7 characters")
        .max(15, "Phone number must not exceed 15 characters")
        .regex(phoneRegex, "Please provide a valid phone number in E.164 format (e.g., +12345678901)")
        .trim()
        .optional()
        .or(z.literal("")),
    contactEmail: z
        .string()
        .email("Invalid contact email")
        .optional()
        .or(z.literal("")),
    hireDate: z
        .string()
        .datetime("Invalid date format")
        .optional(),
});

// Update Employee Schema
export const updateEmployeeSchema = z.object({
    email: z.string().email("Invalid email address").optional(),
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    employeeId: z.string().min(6, "Employee ID must be at least 6 characters").optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    contactPhone: z
        .string()
        .min(7, "Phone number must be at least 7 characters")
        .max(15, "Phone number must not exceed 15 characters")
        .regex(phoneRegex, "Please provide a valid phone number in E.164 format (e.g., +12345678901)")
        .trim()
        .optional()
        .or(z.literal("")),
    contactEmail: z
        .string()
        .email("Invalid contact email")
        .optional()
        .or(z.literal("")),
    hireDate: z
        .string()
        .datetime("Invalid date format")
        .optional(),
    managerId: z.string().optional(),
});

// Employee List Query Schema
export const employeeListQuerySchema = z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    status: z.enum(["Active", "Inactive", "Onboarding", "Terminated"]).optional(),
    department: z.string().trim().optional(),
});

// Type exports
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
export type EmployeeListQueryFormData = z.infer<typeof employeeListQuerySchema>;
