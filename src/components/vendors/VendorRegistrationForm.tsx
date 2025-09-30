"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Vendor, VendorService } from "@/lib/services";
import {
    VendorRegistrationFormData,
    vendorRegistrationSchema,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormMessage } from "@/components/ui/form";
import PasswordPolicyHints from "@/components/auth/PasswordPolicyHints";
import { AddressForm } from "@/components/auth/AddressForm";
import { useEffect } from "react";
import { PhoneInput } from "../ui/phone-input";

export default function VendorRegistrationForm() {
    const [step, setStep] = useState<number>(0);
    const totalSteps = 3;
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | undefined>();

    const form = useForm<VendorRegistrationFormData>({
        resolver: zodResolver(vendorRegistrationSchema),
    });

    const { handleSubmit, control, reset, setError, trigger, watch, setValue } =
        form;
    const passwordValue = watch("password") || "";

    // Fields to validate per-step
    const stepFields: string[][] = [
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

    const onSubmit = async (formData: VendorRegistrationFormData) => {
        // Final submit only on last step
        if (step < totalSteps - 1) {
            // Validate current step fields before moving forward
            const ok = await trigger(stepFields[step] as any);
            if (ok) setStep((s) => s + 1);
            return;
        }

        setIsSubmitting(true);
        setServerError(null);
        setRequestId(undefined);
        try {
            // Ensure servicesOffered is sent as array (it already is from controller)
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
                fieldErrors?: any[];
            };
            setRequestId(anyErr?.requestId as string | undefined);
            // Map backend field errors to form fields
            if (Array.isArray(anyErr?.fieldErrors)) {
                for (const fe of anyErr.fieldErrors as any[]) {
                    if (fe && fe.field) {
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

    const handleBack = () => {
        if (step > 0) setStep((prev) => prev - 1);
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
                    {step === 0 && (
                        <Form {...form}>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="grid gap-y-8"
                            >
                                <FormField
                                    key="Email"
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
                                    key="password"
                                    control={control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    {...field}
                                                    placeholder=""
                                                    register={form.register}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <PasswordPolicyHints
                                                password={passwordValue}
                                            />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    key="confirmPassword"
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
                                                    placeholder=""
                                                    register={form.register}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        className="font-medium"
                                        size="sm"
                                        onClick={handleBack}
                                        disabled={step === 0}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="font-medium"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {step === 1 && (
                        <Form {...form}>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="grid gap-y-4"
                            >
                                <FormField
                                    key="companyName"
                                    control={control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder=""
                                                    autoComplete="off"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    key="contactName"
                                    control={control}
                                    name="contactName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder=""
                                                    autoComplete="off"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    key="contactEmail"
                                    control={control}
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder=""
                                                    autoComplete="off"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    key="contactPhone"
                                    control={control}
                                    name="contactPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Contact Phone Number
                                            </FormLabel>
                                            <FormControl>
                                                {/* PhoneInput is a controlled component; wire it to RHF field */}
                                                <PhoneInput
                                                    value={field.value as any}
                                                    onChange={(val) =>
                                                        // react-phone-number-input sometimes
                                                        // returns undefined for empty values; coerce to empty string
                                                        field.onChange(
                                                            val || ""
                                                        )
                                                    }
                                                    placeholder=""
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        className="font-medium"
                                        size="sm"
                                        onClick={handleBack}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="font-medium"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {step === 2 && (
                        <Form {...form}>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="grid gap-y-4"
                            >
                                <FormField
                                    key="website"
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

                                {/* Services offered as tag input */}
                                <FormField
                                    key="servicesOffered"
                                    control={control}
                                    name="servicesOffered"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Services Offered
                                            </FormLabel>
                                            <FormControl>
                                                <ServicesInput field={field} />
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
                                    <AddressForm
                                        prefix="mailingAddress"
                                        title="Mailing Address"
                                    />
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

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        className="font-medium"
                                        size="sm"
                                        onClick={handleBack}
                                    >
                                        Back
                                    </Button>
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
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* Helper small component for services tags — kept local to avoid extra file */
function ServicesInput({ field }: { field: any }) {
    const [input, setInput] = useState("");

    useEffect(() => {
        // ensure field value is always an array
        if (!Array.isArray(field.value)) field.onChange([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addTag = () => {
        const v = input.trim();
        if (!v) return;
        const next = Array.isArray(field.value) ? [...field.value, v] : [v];
        field.onChange(next);
        setInput("");
    };

    const removeTag = (idx: number) => {
        const next = (field.value || []).filter(
            (_: any, i: number) => i !== idx
        );
        field.onChange(next);
    };

    return (
        <div>
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                    placeholder="Add a service and press Enter"
                />
                <Button type="button" onClick={addTag} size="sm">
                    Add
                </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {(field.value || []).map((t: string, idx: number) => (
                    <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded bg-muted text-sm"
                    >
                        {t}
                        <Button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="ml-1 text-destructive"
                            aria-label={`Remove ${t}`}
                        >
                            ×
                        </Button>
                    </span>
                ))}
            </div>
        </div>
    );
}
