"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
    AccountActivationFormData,
    accountActivationSchema,
} from "@/lib/validations/auth";
import { AuthService } from "@/lib/services/auth";
import { toast } from "sonner";
import { AddressForm } from "@/components/common";

// TODO: make activate account flow similar to vendor account creation (VendorRegistrationForm)

function ActivateAccountInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = useMemo(
        () => searchParams?.get("token") || "",
        [searchParams]
    );

    const [isValidating, setIsValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenEmail, setTokenEmail] = useState<string | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm<AccountActivationFormData>({
        resolver: zodResolver(accountActivationSchema),
        defaultValues: {
            token,
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

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        control,
    } = methods;

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenValid(false);
                setIsValidating(false);
                return;
            }

            try {
                const result = await AuthService.validateActivationToken(token);
                setTokenValid(result.valid);
                if (result.valid) {
                    setTokenEmail(result.email);
                    // Pre-fill name fields if available
                    if (result.firstName) {
                        setValue("firstName", result.firstName);
                    }
                    if (result.lastName) {
                        setValue("lastName", result.lastName);
                    }
                }
            } catch (err) {
                toast.error(
                    "Error validating activation link" +
                        (err instanceof Error ? `: ${err.message}` : "")
                );
                setTokenValid(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token, setValue]);

    const onSubmit = async (data: AccountActivationFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Filter out empty optional fields
            const cleanData = {
                ...data,
                contactEmail: data.contactEmail || undefined,
                contactPhone: data.contactPhone || undefined,
                physicalAddress: data.physicalAddress?.line1
                    ? data.physicalAddress
                    : undefined,
                mailingAddress: data.mailingAddress?.line1
                    ? data.mailingAddress
                    : undefined,
            };

            await AuthService.completeActivation(cleanData);
            setSuccess(true);
            // Redirect to login after 2 seconds
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: unknown) {
            const anyErr = err as {
                status?: number;
                message?: unknown;
            };
            if (typeof anyErr.message === "string") {
                setError(anyErr.message);
            } else {
                setError(
                    "Failed to activate account. Please try again or contact support."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyPhysicalToMailing = () => {
        const physicalAddress = watch("physicalAddress");
        if (physicalAddress) {
            setValue("mailingAddress", physicalAddress);
        }
    };

    // Loading state while validating token
    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-600">
                        Validating activation link...
                    </p>
                </motion.div>
            </div>
        );
    }

    // Invalid or expired token
    if (!token || !tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card>
                        <CardHeader>
                            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <CardTitle className="text-center">
                                Invalid Activation Link
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-gray-600">
                                This activation link is invalid or has expired.
                            </p>
                            <p className="text-sm text-gray-500">
                                Please contact your administrator to receive a
                                new activation link.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card>
                        <CardHeader>
                            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-center">
                                Account Activated!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-gray-600">
                                Your account has been successfully activated.
                            </p>
                            <p className="text-sm text-gray-500">
                                Redirecting you to login...
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Activation form
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Activate Your Account
                        </CardTitle>
                        <CardDescription>
                            Complete your profile and choose a password to get
                            started
                            {tokenEmail && (
                                <span className="block mt-1 text-sm font-medium">
                                    Account: {tokenEmail}
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormProvider {...methods}>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{
                                            opacity: 1,
                                            height: "auto",
                                        }}
                                        className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <div className="text-red-700 text-sm flex-1">
                                            {error}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">
                                        Basic Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName">
                                                First Name *
                                            </Label>
                                            <Input
                                                id="firstName"
                                                {...register("firstName")}
                                                placeholder="John"
                                            />
                                            {errors.firstName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.firstName.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="lastName">
                                                Last Name *
                                            </Label>
                                            <Input
                                                id="lastName"
                                                {...register("lastName")}
                                                placeholder="Doe"
                                            />
                                            {errors.lastName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.lastName.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Password Setup */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">
                                        Password Setup
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="newPassword"
                                            control={control}
                                            render={({ field }) => (
                                                <PasswordInput
                                                    {...field}
                                                    label={
                                                        <>
                                                            Password{" "}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </>
                                                    }
                                                    id="newPassword"
                                                    placeholder="••••••••"
                                                    showPasswordHint
                                                    error={
                                                        errors.newPassword
                                                            ?.message
                                                    }
                                                />
                                            )}
                                        />

                                        <Controller
                                            name="confirmPassword"
                                            control={control}
                                            render={({ field }) => (
                                                <PasswordInput
                                                    {...field}
                                                    label={
                                                        <>
                                                            Confirm Password{" "}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </>
                                                    }
                                                    id="confirmPassword"
                                                    placeholder="••••••••"
                                                    error={
                                                        errors.confirmPassword
                                                            ?.message
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Optional Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">
                                        Contact Information (Optional)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contactEmail">
                                                Contact Email
                                            </Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                {...register("contactEmail")}
                                                placeholder="personal@example.com"
                                            />
                                            {errors.contactEmail && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {
                                                        errors.contactEmail
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <Controller
                                            name="contactPhone"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    <Label htmlFor="contactPhone">
                                                        Phone Number
                                                    </Label>
                                                    <PhoneInput
                                                        value={
                                                            (field.value as string) ||
                                                            ""
                                                        }
                                                        onChange={(val) =>
                                                            field.onChange(
                                                                val || ""
                                                            )
                                                        }
                                                        placeholder="+1 234-567-8900"
                                                    />
                                                    {errors.contactPhone && (
                                                        <p className="text-red-500 text-sm mt-1">
                                                            {
                                                                errors
                                                                    .contactPhone
                                                                    .message
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Optional Address Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">
                                        Address Information (Optional)
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <AddressForm
                                                prefix="physicalAddress"
                                                title="Physical Address"
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={copyPhysicalToMailing}
                                            className="w-full"
                                        >
                                            Copy Physical Address to Mailing
                                            Address
                                        </Button>

                                        <div>
                                            <AddressForm
                                                prefix="mailingAddress"
                                                title="Mailing Address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Activating..."
                                        : "Activate Account"}
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{" "}
                                        <Link
                                            href="/login"
                                            className="font-medium text-blue-600 hover:text-blue-500"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function ActivateAccountPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            }
        >
            <ActivateAccountInner />
        </Suspense>
    );
}
