"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, User, AlertCircle, CheckCircle } from "lucide-react";

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
import { AddressForm } from "@/components/auth/AddressForm";

import {
    EmployeeRegistrationFormData,
    employeeRegistrationSchema,
} from "@/lib/validations/auth";
import { AuthService } from "@/lib/services/auth";

export default function EmployeeRegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [requestId, setRequestId] = useState<string | undefined>();

    const methods = useForm<EmployeeRegistrationFormData>({
        resolver: zodResolver(employeeRegistrationSchema),
        defaultValues: {
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
    } = methods;

    const onSubmit = async (data: EmployeeRegistrationFormData) => {
        setIsLoading(true);
        setError(null);
        setRequestId(undefined);

        try {
            // Filter out empty optional fields and addresses
            const cleanData = {
                ...data,
                employeeId: data.employeeId || undefined,
                jobTitle: data.jobTitle || undefined,
                department: data.department || undefined,
                hireDate: data.hireDate || undefined,
                contactEmail: data.contactEmail || undefined,
                contactPhone: data.contactPhone || undefined,
                physicalAddress: data.physicalAddress?.line1
                    ? data.physicalAddress
                    : undefined,
                mailingAddress: data.mailingAddress?.line1
                    ? data.mailingAddress
                    : undefined,
            };

            await AuthService.registerEmployee(cleanData);
            setSuccess(true);
        } catch (err: unknown) {
            const anyErr = err as {
                status?: number;
                message?: unknown;
                requestId?: string;
            };
            setRequestId(anyErr?.requestId);
            if (anyErr?.status === 409) {
                setError("An account with this email already exists.");
            } else if (anyErr?.message) {
                setError(String(anyErr.message));
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyPhysicalToMailing = () => {
        const physicalAddress = watch("physicalAddress");
        if (physicalAddress) {
            setValue("mailingAddress", physicalAddress);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-xl text-green-800">
                                Registration Successful!
                            </CardTitle>
                            <CardDescription>
                                Your employee account has been created and is
                                pending approval. You&apos;ll be notified via
                                email once your account is approved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/login">
                                <Button className="w-full">
                                    Return to Login
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Employee Registration
                        </CardTitle>
                        <CardDescription>
                            Create your employee account. Your account will need
                            approval before you can sign in.
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
                                        {requestId && (
                                            <span className="text-xs text-muted-foreground">
                                                Req: {requestId}
                                            </span>
                                        )}
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

                                    <div>
                                        <Label htmlFor="email">
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...register("email")}
                                            placeholder="john.doe@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="password">
                                                Password *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    {...register("password")}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.password.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="confirmPassword">
                                                Confirm Password *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    {...register(
                                                        "confirmPassword"
                                                    )}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {
                                                        errors.confirmPassword
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">
                                        Employment Information (Optional)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="employeeId">
                                                Employee ID
                                            </Label>
                                            <Input
                                                id="employeeId"
                                                {...register("employeeId")}
                                                placeholder="E12345"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="jobTitle">
                                                Job Title
                                            </Label>
                                            <Input
                                                id="jobTitle"
                                                {...register("jobTitle")}
                                                placeholder="Software Engineer"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="department">
                                                Department
                                            </Label>
                                            <Input
                                                id="department"
                                                {...register("department")}
                                                placeholder="Engineering"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="hireDate">
                                                Hire Date
                                            </Label>
                                            <Input
                                                id="hireDate"
                                                type="date"
                                                {...register("hireDate")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
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
                                                placeholder="john.personal@example.com"
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

                                        <div>
                                            <Label htmlFor="contactPhone">
                                                Contact Phone
                                            </Label>
                                            <Input
                                                id="contactPhone"
                                                {...register("contactPhone")}
                                                placeholder="+1-555-123-4567"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Addresses */}
                                <div className="space-y-6">
                                    <AddressForm
                                        prefix="physicalAddress"
                                        title="Physical Address"
                                    />

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={copyPhysicalToMailing}
                                        >
                                            Copy Physical to Mailing
                                        </Button>
                                    </div>

                                    <AddressForm
                                        prefix="mailingAddress"
                                        title="Mailing Address"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Creating Account..."
                                        : "Create Employee Account"}
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
                                    <p className="text-sm text-gray-600 mt-1">
                                        Are you a vendor?{" "}
                                        <Link
                                            href="/register/vendor"
                                            className="font-medium text-blue-600 hover:text-blue-500"
                                        >
                                            Register as Vendor
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
