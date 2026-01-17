"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/ui/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import { AddressForm } from "@/components/common";
import { User as UserIcon } from "lucide-react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addressSchema } from "@/lib/validations/auth";
import { TEXT_CONSTRAINTS } from "@/lib/constants/validation";
import { mapBackendErrorsToForm } from "@/lib/utils/error-mapping";

const profileSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required")
        .max(
            TEXT_CONSTRAINTS.FIRST_NAME_MAX_LENGTH,
            `First name cannot exceed ${TEXT_CONSTRAINTS.FIRST_NAME_MAX_LENGTH} characters`
        ),
    lastName: z
        .string()
        .min(1, "Last name is required")
        .max(
            TEXT_CONSTRAINTS.LAST_NAME_MAX_LENGTH,
            `Last name cannot exceed ${TEXT_CONSTRAINTS.LAST_NAME_MAX_LENGTH} characters`
        ),
    contactEmail: z
        .string()
        .email("Invalid email")
        .max(
            TEXT_CONSTRAINTS.EMAIL_MAX_LENGTH,
            `Email cannot exceed ${TEXT_CONSTRAINTS.EMAIL_MAX_LENGTH} characters`
        )
        .optional()
        .or(z.literal("")),
    contactPhone: z
        .string()
        .max(
            TEXT_CONSTRAINTS.PHONE_MAX_LENGTH,
            `Phone cannot exceed ${TEXT_CONSTRAINTS.PHONE_MAX_LENGTH} characters`
        )
        .optional(),
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
}: Readonly<GeneralInfoSectionProps>) {
    const methods = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues,
        mode: "onBlur",
        shouldUnregister: false, // Keep form values even when fields are unmounted
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        control,
        setError,
        setValue,
        watch,
    } = methods;

    // State for "mailing address same as physical" checkbox
    const [sameAsPhysical, setSameAsPhysical] = useState(false);

    // Watch physical address to auto-sync to mailing when checkbox is checked
    const physicalAddress = watch("physicalAddress");

    // Auto-sync physical address to mailing address when checkbox is checked
    useEffect(() => {
        if (sameAsPhysical && physicalAddress) {
            setValue("mailingAddress.line1", physicalAddress.line1 || "");
            setValue("mailingAddress.line2", physicalAddress.line2 || "");
            setValue("mailingAddress.city", physicalAddress.city || "");
            setValue("mailingAddress.state", physicalAddress.state || "");
            setValue("mailingAddress.zip", physicalAddress.zip || "");
        }
    }, [sameAsPhysical, physicalAddress, setValue]);

    // Keep nested address fields in sync when parent defaultValues change
    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    // Handle form submission with backend error mapping
    const onSubmitForm = async (data: ProfileFormData) => {
        try {
            await onSubmit(data);
        } catch (error) {
            // Map backend validation errors to form fields
            mapBackendErrorsToForm(error, setError);
            throw error; // Re-throw to let parent handle toast
        }
    };

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
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
                        <Input
                            id="firstName"
                            {...register("firstName")}
                            maxLength={TEXT_CONSTRAINTS.FIRST_NAME_MAX_LENGTH}
                            aria-required="true"
                            aria-invalid={!!errors.firstName}
                            aria-describedby={
                                errors.firstName ? "firstName-error" : undefined
                            }
                        />
                        {errors.firstName && (
                            <p
                                id="firstName-error"
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">
                            Last Name{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="lastName"
                            {...register("lastName")}
                            maxLength={TEXT_CONSTRAINTS.LAST_NAME_MAX_LENGTH}
                            aria-required="true"
                            aria-invalid={!!errors.lastName}
                            aria-describedby={
                                errors.lastName ? "lastName-error" : undefined
                            }
                        />
                        {errors.lastName && (
                            <p
                                id="lastName-error"
                                className="text-sm text-destructive"
                                role="alert"
                            >
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
                            maxLength={TEXT_CONSTRAINTS.EMAIL_MAX_LENGTH}
                            aria-invalid={!!errors.contactEmail}
                            aria-describedby={
                                errors.contactEmail
                                    ? "contactEmail-error"
                                    : undefined
                            }
                        />
                        {errors.contactEmail && (
                            <p
                                id="contactEmail-error"
                                className="text-sm text-destructive"
                                role="alert"
                            >
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

                        <div className="flex items-center space-x-2 py-2">
                            <Checkbox
                                id="sameAsPhysical"
                                checked={sameAsPhysical}
                                onCheckedChange={(checked) => {
                                    const isChecked = checked === true;
                                    setSameAsPhysical(isChecked);

                                    if (isChecked && physicalAddress) {
                                        // Copy physical address to mailing address
                                        setValue(
                                            "mailingAddress.line1",
                                            physicalAddress.line1 || ""
                                        );
                                        setValue(
                                            "mailingAddress.line2",
                                            physicalAddress.line2 || ""
                                        );
                                        setValue(
                                            "mailingAddress.city",
                                            physicalAddress.city || ""
                                        );
                                        setValue(
                                            "mailingAddress.state",
                                            physicalAddress.state || ""
                                        );
                                        setValue(
                                            "mailingAddress.zip",
                                            physicalAddress.zip || ""
                                        );
                                    }
                                }}
                            />
                            <label
                                htmlFor="sameAsPhysical"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                Mailing address same as physical address
                            </label>
                        </div>

                        {!sameAsPhysical && (
                            <>
                                <Separator />
                                <AddressForm
                                    prefix="mailingAddress"
                                    title="Mailing Address"
                                    idPrefix="mailing"
                                />
                            </>
                        )}
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
