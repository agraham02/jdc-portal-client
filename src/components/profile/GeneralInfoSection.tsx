"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressForm } from "@/components/common";
import { User as UserIcon } from "lucide-react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Address } from "@/lib/types/auth";

// Address schema for validation
const addressSchema = z.object({
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z
        .string()
        .length(2, "State must be 2 characters")
        .regex(/^[A-Z]{2}$/, "State must be uppercase letters"),
    zip: z
        .string()
        .min(5, "ZIP code must be at least 5 characters")
        .regex(/^[A-Za-z0-9\s-]+$/, "Invalid ZIP code format"),
});

const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    contactEmail: z
        .string()
        .email("Invalid email")
        .optional()
        .or(z.literal("")),
    contactPhone: z.string().optional(),
    physicalAddress: addressSchema.optional(),
    mailingAddress: addressSchema.optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface GeneralInfoSectionProps {
    defaultValues: ProfileFormData;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    isSubmitting: boolean;
}

export function GeneralInfoSection({
    defaultValues,
    onSubmit,
    isSubmitting,
}: GeneralInfoSectionProps) {
    const methods = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues,
        mode: "onBlur",
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        control,
    } = methods;

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <UserIcon className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">
                            General Information
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Your personal contact information
                    </p>
                    <Separator className="mb-6" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">
                            First Name{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input id="firstName" {...register("firstName")} />
                        {errors.firstName && (
                            <p className="text-sm text-destructive">
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">
                            Last Name{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input id="lastName" {...register("lastName")} />
                        {errors.lastName && (
                            <p className="text-sm text-destructive">
                                {errors.lastName.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            {...register("contactEmail")}
                            placeholder="personal@example.com"
                        />
                        {errors.contactEmail && (
                            <p className="text-sm text-destructive">
                                {errors.contactEmail.message}
                            </p>
                        )}
                    </div>
                    <Controller
                        name="contactPhone"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">
                                    Contact Phone
                                </Label>
                                <PhoneInput
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    value={field.value as any}
                                    onChange={(val) =>
                                        field.onChange(val || "")
                                    }
                                    placeholder="+1 234-567-8900"
                                />
                                {errors.contactPhone && (
                                    <p className="text-sm text-destructive">
                                        {errors.contactPhone.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </div>

                {/* Addresses - Editable */}
                <Separator />
                <FormProvider {...methods}>
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Addresses</h3>
                        <p className="text-sm text-muted-foreground -mt-4">
                            Update your physical and mailing addresses
                        </p>

                        <AddressForm
                            prefix="physicalAddress"
                            title="Physical Address"
                            idPrefix="physical"
                        />

                        <Separator />

                        <AddressForm
                            prefix="mailingAddress"
                            title="Mailing Address"
                            idPrefix="mailing"
                        />
                    </div>
                </FormProvider>

                <Separator />

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => reset(defaultValues)}
                    >
                        Reset
                    </Button>
                </div>
            </form>
        </Card>
    );
}
