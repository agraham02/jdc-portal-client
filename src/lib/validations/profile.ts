import { z } from "zod";

export const profileUpdateSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    contactEmail: z
        .string()
        .email("Invalid email address")
        .max(320)
        .optional()
        .or(z.literal("")),
    contactPhone: z
        .string()
        .max(50)
        .optional()
        .or(z.literal("")),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
