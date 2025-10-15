"use client";

import { useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { VendorService } from "@/lib/services";
import {
    VendorRegistrationFormData,
    vendorRegistrationSchema,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormMessage } from "@/components/ui/form";
import { PhoneInput } from "../ui/phone-input";
import { AddressForm, ServicesInput } from "../common";

export default function VendorRegistrationForm() {
    const [step, setStep] = useState<number>(0);
    const [sameAsPhysical, setSameAsPhysical] = useState(false);
    const totalSteps = 3;
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | undefined>();

    const methods = useForm<VendorRegistrationFormData>({
        resolver: zodResolver(vendorRegistrationSchema),
        mode: "onChange", // Validate on change for better UX in multi-step forms
        reValidateMode: "onChange", // Re-validate on change after first submit attempt
        shouldUnregister: false, // Keep field values when inputs unmount (multi-step form)
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            companyName: "",
            contactName: "",
            contactEmail: "",
            contactPhone: "",
            website: "",
            servicesOffered: [],
            physicalAddress: {
                line1: "",
                line2: "",
                city: "",
                state: "",
                zip: "",
            },
            mailingAddress: {
                line1: "",
                line2: "",
                city: "",
                state: "",
                zip: "",
            },
        },
    });

    const { handleSubmit, control, reset, setError, trigger, setValue } =
        methods;

    // Fields to validate per-step
    const stepFields: Array<Array<keyof VendorRegistrationFormData | string>> =
        [
            ["email", "password", "confirmPassword"],
            ["companyName", "contactName", "contactEmail", "contactPhone"],
            [
                "website",
                "servicesOffered",
                "physicalAddress.line1",
                "physicalAddress.city",
                "physicalAddress.state",
                "physicalAddress.zip",
            ],
        ];

    const handleNext = async () => {
        // Validate only the current step's fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form trigger accepts field paths as any
        const isValid = await trigger(stepFields[step] as any, { 
            shouldFocus: true // Focus on first error field
        });

        if (isValid) {
            setStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep((prev) => prev - 1);
        }
    };

    const onSubmit = async (formData: VendorRegistrationFormData) => {
        setIsSubmitting(true);
        setServerError(null);
        setRequestId(undefined);

        try {
            await VendorService.createVendor(formData);
            toast.success("Registration submitted — awaiting approval");
            reset();
            try {
                router.push("/login?registered=1");
            } catch {
                // ignore in tests
            }
        } catch (e: unknown) {
            const anyErr = e as Record<string, unknown> & {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Backend field errors have dynamic structure
                fieldErrors?: any[];
            };
            setRequestId(anyErr?.requestId as string | undefined);

            // Map backend field errors to form fields
            if (Array.isArray(anyErr?.fieldErrors)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Backend field error structure is dynamic
                for (const fe of anyErr.fieldErrors as any[]) {
                    if (fe && fe.field) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Field name from backend can be any form field
                        setError(fe.field as any, {
                            type: "server",
                            message: String(fe.message || fe.code || "Invalid"),
                        });
                    }
                }
            }

            // Fallback message
            const maybeMsg =
                (anyErr?.message as string | undefined) ||
                (anyErr?.status == 409
                    ? "An account with this email already exists."
                    : undefined);
            setServerError(maybeMsg ?? "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="flex items-center">
                        <div
                            className={cn(
                                "w-4 h-4 rounded-full transition-all duration-300 ease-in-out",
                                index <= step ? "bg-primary" : "bg-primary/30",
                                index < step && "bg-primary"
                            )}
                        />
                        {index < totalSteps - 1 && (
                            <div
                                className={cn(
                                    "w-8 h-0.5",
                                    index < step
                                        ? "bg-primary"
                                        : "bg-primary/30"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">
                        Vendor Registration
                    </CardTitle>
                    <CardDescription>
                        Step {step + 1} of {totalSteps}
                    </CardDescription>
                </CardHeader>
                {/* Dev helpers: autofill & clear - only show in development */}
                {process.env.NODE_ENV === "development" && (
                    <div className="p-3 border-t border-b bg-muted/40 flex items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                            Development helpers
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    // Populate all fields with sensible test data
                                    setValue("email", "vendor.test@jdc.com");
                                    setValue("password", "Password123!");
                                    setValue("confirmPassword", "Password123!");

                                    setValue("companyName", "Test Vendor LLC");
                                    setValue("contactName", "Jane Doe");
                                    setValue(
                                        "contactEmail",
                                        "contact@vendor.test"
                                    );
                                    setValue("contactPhone", "+17573492454");

                                    setValue("website", "https://vendor.test");
                                    setValue("servicesOffered", [
                                        "Consulting",
                                        "Training",
                                    ]);

                                    setValue(
                                        "physicalAddress.line1",
                                        "123 Test St"
                                    );
                                    setValue(
                                        "physicalAddress.line2",
                                        "Suite 100"
                                    );
                                    setValue(
                                        "physicalAddress.city",
                                        "Testville"
                                    );
                                    setValue("physicalAddress.state", "TS");
                                    setValue("physicalAddress.zip", "12345");

                                    setValue(
                                        "mailingAddress.line1",
                                        "PO Box 1"
                                    );
                                    setValue(
                                        "mailingAddress.city",
                                        "Testville"
                                    );
                                    setValue("mailingAddress.state", "TS");
                                    setValue("mailingAddress.zip", "12345");

                                    // move to first step
                                    setStep(0);
                                }}
                            >
                                Autofill
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    reset();
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}
                <CardContent>
                    <FormProvider {...methods}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Step 0: Account Credentials */}
                            {step === 0 && (
                                <div className="grid gap-y-8">
                                    <FormField
                                        control={control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="email@example.com"
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        {...field}
                                                        placeholder="Create a secure password"
                                                        showPasswordHint
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm Password
                                                </FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        {...field}
                                                        placeholder="Re-enter your password"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 1: Contact Information */}
                            {step === 1 && (
                                <div className="grid gap-y-4">
                                    <FormField
                                        control={control}
                                        name="companyName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Company Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Acme Corp"
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="contactName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Contact Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="John Doe"
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="contactEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Contact Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="contact@company.com"
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="contactPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Contact Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    {/* eslint-disable @typescript-eslint/no-explicit-any */}
                                                    <PhoneInput
                                                        value={
                                                            field.value as any
                                                        }
                                                        onChange={(val) =>
                                                            field.onChange(
                                                                val || ""
                                                            )
                                                        }
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                    {/* eslint-enable @typescript-eslint/no-explicit-any */}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 2: Business Details */}
                            {step === 2 && (
                                <div className="grid gap-y-4">
                                    <FormField
                                        control={control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="https://example.com"
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="servicesOffered"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Services Offered
                                                </FormLabel>
                                                <FormControl>
                                                    <ServicesInput
                                                        id="servicesOffered"
                                                        label=""
                                                        value={
                                                            field.value || []
                                                        }
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        placeholder="Type and press Enter to add"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-4">
                                        <AddressForm
                                            prefix="physicalAddress"
                                            title="Physical Address"
                                            required
                                        />

                                        <div className="flex items-center space-x-2 py-2">
                                            <Checkbox
                                                id="sameAsPhysical"
                                                checked={sameAsPhysical}
                                                onCheckedChange={(checked) => {
                                                    const isChecked = checked === true;
                                                    setSameAsPhysical(isChecked);
                                                    
                                                    if (isChecked) {
                                                        // Copy physical address to mailing address
                                                        const physicalAddress = methods.getValues("physicalAddress");
                                                        setValue("mailingAddress.line1", physicalAddress.line1);
                                                        setValue("mailingAddress.line2", physicalAddress.line2 || "");
                                                        setValue("mailingAddress.city", physicalAddress.city);
                                                        setValue("mailingAddress.state", physicalAddress.state);
                                                        setValue("mailingAddress.zip", physicalAddress.zip);
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
                                            <AddressForm
                                                prefix="mailingAddress"
                                                title="Mailing Address"
                                            />
                                        )}
                                    </div>

                                    {serverError && (
                                        <div
                                            role="alert"
                                            aria-live="polite"
                                            className="text-sm text-destructive bg-destructive/10 p-3 rounded"
                                        >
                                            {serverError}
                                            {requestId && (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    Request ID:{" "}
                                                    <code className="px-2 py-1 bg-muted/30 rounded select-all">
                                                        {requestId}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-4">
                                <Button
                                    type="button"
                                    className="font-medium"
                                    size="sm"
                                    onClick={handleBack}
                                    disabled={step === 0}
                                >
                                    Back
                                </Button>

                                {step < totalSteps - 1 ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="font-medium"
                                        onClick={handleNext}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="font-medium"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Submitting..."
                                            : "Submit"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
}
