import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Address schema for reuse
export const addressSchema = z.object({
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zip: z.string().min(5, "ZIP code must be at least 5 characters"),
});

// Employee registration schema
export const employeeRegistrationSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
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
        password: z.string().min(8, "Password must be at least 8 characters"),
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
        contactPhone: z.string().min(1, "Contact phone is required"),
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
