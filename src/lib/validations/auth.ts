import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants/auth";
import {
    ADDRESS_CONSTRAINTS,
    VALIDATION_PATTERNS,
    VALIDATION_MESSAGES,
} from "@/lib/constants/validation";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Base address schema - minimal per-field validation, main logic in superRefine
const baseAddressSchema = z.object({
    line1: z
        .string()
        .max(
            ADDRESS_CONSTRAINTS.LINE1_MAX_LENGTH,
            VALIDATION_MESSAGES.ADDRESS_LINE1_MAX
        ),
    line2: z
        .string()
        .max(
            ADDRESS_CONSTRAINTS.LINE2_MAX_LENGTH,
            VALIDATION_MESSAGES.ADDRESS_LINE2_MAX
        )
        .optional(),
    city: z
        .string()
        .max(ADDRESS_CONSTRAINTS.CITY_MAX_LENGTH, VALIDATION_MESSAGES.CITY_MAX),
    state: z.string(),
    zip: z
        .string()
        .max(ADDRESS_CONSTRAINTS.ZIP_MAX_LENGTH, VALIDATION_MESSAGES.ZIP_MAX),
});

/**
 * Address schema with "all or nothing" validation
 * If any field is filled, all required fields (line1, city, state, zip) must be filled
 * line2 is always optional
 *
 * Validation logic:
 * - All fields empty → valid (address is optional)
 * - Some fields filled → all core fields required with format validation
 */
export const addressSchema = baseAddressSchema
    .partial()
    .superRefine((data, ctx) => {
        // Compute once for efficiency - treat empty strings as unfilled
        const hasAnyValue = Boolean(
            data.line1?.trim() ||
                data.city?.trim() ||
                data.state?.trim() ||
                data.zip?.trim()
        );

        // If no fields filled (or all empty strings), address is optional - pass validation
        if (!hasAnyValue) return;

        // If ANY field is filled, require core fields (line2 still optional)
        // Check presence and format together
        if (!data.line1?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_MESSAGES.ADDRESS_LINE1_REQUIRED,
                path: ["line1"],
            });
        }

        if (!data.city?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_MESSAGES.CITY_REQUIRED,
                path: ["city"],
            });
        }

        // State: required + must be 2 uppercase letters
        const stateTrimmed = data.state?.trim().toUpperCase();
        if (!stateTrimmed) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_MESSAGES.STATE_REQUIRED,
                path: ["state"],
            });
        } else if (!VALIDATION_PATTERNS.STATE_CODE.test(stateTrimmed)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_MESSAGES.STATE_FORMAT,
                path: ["state"],
            });
        }

        // ZIP: required + format check
        const zipTrimmed = data.zip?.trim();
        if (!zipTrimmed) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_MESSAGES.ZIP_REQUIRED,
                path: ["zip"],
            });
        } else if (!VALIDATION_PATTERNS.ZIP_CODE.test(zipTrimmed)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_MESSAGES.ZIP_FORMAT,
                path: ["zip"],
            });
        }
    });

// Password policy used across registration, reset, and change flows
export const passwordComplexity = z
    .string()
    .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    )
    .refine((v) => /[A-Z]/.test(v), {
        message: "Must include at least one uppercase letter",
    })
    .refine((v) => /[a-z]/.test(v), {
        message: "Must include at least one lowercase letter",
    })
    .refine((v) => /\d/.test(v), {
        message: "Must include at least one number",
    })
    .refine((v) => /[^A-Za-z0-9]/.test(v), {
        message: "Must include at least one special character",
    });

export const employeeRegistrationSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        password: passwordComplexity,
        confirmPassword: z.string(),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        employeeId: z.string().optional(),
        jobTitle: z.string().optional(),
        department: z.string().optional(),
        hireDate: z.string().optional(),
        contactEmail: z
            .string()
            .email("Invalid contact email")
            .optional()
            .or(z.literal("")),
        contactPhone: z.string().optional(),
        physicalAddress: addressSchema.optional(),
        mailingAddress: addressSchema.optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

// Vendor registration schema
export const vendorRegistrationSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        password: passwordComplexity,
        confirmPassword: z.string(),
        companyName: z.string().min(1, "Company name is required"),
        website: z
            .string()
            .url("Invalid website URL")
            .optional()
            .or(z.literal("")),
        contactName: z.string().min(1, "Contact name is required"),
        servicesOffered: z
            .array(z.string())
            .min(1, "At least one service must be specified"),
        contactEmail: z.string().email("Invalid contact email"),
        contactPhone: z.string().min(1, "Contact phone is required").optional(),
        physicalAddress: addressSchema,
        mailingAddress: addressSchema,
        firstName: z.string().optional(),
        lastName: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export type EmployeeRegistrationFormData = z.infer<
    typeof employeeRegistrationSchema
>;
export type VendorRegistrationFormData = z.infer<
    typeof vendorRegistrationSchema
>;
export type AddressFormData = z.infer<typeof addressSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z
    .object({
        newPassword: passwordComplexity,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Change password schema (when signed in)
export const changePasswordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordComplexity,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.newPassword !== data.oldPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Account activation schema (for new employees)
export const accountActivationSchema = z
    .object({
        token: z.string(),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        contactEmail: z
            .string()
            .email("Invalid contact email")
            .optional()
            .or(z.literal("")),
        contactPhone: z.string().optional(),
        physicalAddress: addressSchema.optional(),
        mailingAddress: addressSchema.optional(),
        newPassword: passwordComplexity,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type AccountActivationFormData = z.infer<typeof accountActivationSchema>;
