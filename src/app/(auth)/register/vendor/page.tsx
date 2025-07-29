"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Eye,
    EyeOff,
    Building2,
    AlertCircle,
    CheckCircle,
    Plus,
    X,
} from "lucide-react";

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
    VendorRegistrationFormData,
    vendorRegistrationSchema,
} from "@/lib/validations/auth";
import { AuthService } from "@/lib/services";
import { PublicRoute } from "@/components/auth/PublicRoute";

export default function VendorRegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [services, setServices] = useState<string[]>([""]);

    const methods = useForm<VendorRegistrationFormData>({
        resolver: zodResolver(vendorRegistrationSchema),
        defaultValues: {
            servicesOffered: [""],
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

    const onSubmit = async (data: VendorRegistrationFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Filter out empty services and optional fields
            const cleanData = {
                ...data,
                servicesOffered: data.servicesOffered.filter(
                    (service) => service.trim() !== ""
                ),
                website: data.website || undefined,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
            };

            await AuthService.registerVendor(cleanData);
            setSuccess(true);
        } catch (err: unknown) {
            console.error("Registration failed:", err);
            console.log(err);
            const error = err as { response?: { data?: { message?: string } } };
            setError(
                error.response?.data?.message ||
                    err + "" ||
                    "Registration failed. Please try again."
            );
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

    const addService = () => {
        const newServices = [...services, ""];
        setServices(newServices);
        setValue("servicesOffered", newServices);
    };

    const removeService = (index: number) => {
        const newServices = services.filter((_, i) => i !== index);
        setServices(newServices);
        setValue("servicesOffered", newServices);
    };

    const updateService = (index: number, value: string) => {
        const newServices = [...services];
        newServices[index] = value;
        setServices(newServices);
        setValue("servicesOffered", newServices);
    };

    if (success) {
        return (
            <PublicRoute>
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
                                    Your vendor account has been created and is
                                    pending approval. You&apos;ll be notified
                                    via email once your account is approved.
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
            </PublicRoute>
        );
    }

    return (
        <PublicRoute>
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
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Vendor Registration
                            </CardTitle>
                            <CardDescription>
                                Create your vendor account. Your account will
                                need approval before you can sign in.
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
                                            <p className="text-red-700 text-sm">
                                                {error}
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Company Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">
                                            Company Information
                                        </h3>

                                        <div>
                                            <Label htmlFor="companyName">
                                                Company Name *
                                            </Label>
                                            <Input
                                                id="companyName"
                                                {...register("companyName")}
                                                placeholder="Acme Corporation"
                                            />
                                            {errors.companyName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.companyName.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="website">
                                                Company Website
                                            </Label>
                                            <Input
                                                id="website"
                                                type="url"
                                                {...register("website")}
                                                placeholder="https://acme.com"
                                            />
                                            {errors.website && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.website.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Services Offered *</Label>
                                            <div className="space-y-2">
                                                {services.map(
                                                    (service, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Input
                                                                value={service}
                                                                onChange={(e) =>
                                                                    updateService(
                                                                        index,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g., IT Consulting, Web Development"
                                                                className="flex-1"
                                                            />
                                                            {services.length >
                                                                1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    aria-label="Remove service"
                                                                    onClick={() =>
                                                                        removeService(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addService}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Service
                                                </Button>
                                            </div>
                                            {errors.servicesOffered && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {
                                                        errors.servicesOffered
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">
                                            Primary Contact Information
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="contactName">
                                                    Contact Name *
                                                </Label>
                                                <Input
                                                    id="contactName"
                                                    {...register("contactName")}
                                                    placeholder="Jane Smith"
                                                />
                                                {errors.contactName && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {
                                                            errors.contactName
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="contactPhone">
                                                    Contact Phone *
                                                </Label>
                                                <Input
                                                    id="contactPhone"
                                                    {...register(
                                                        "contactPhone"
                                                    )}
                                                    placeholder="+1-555-987-6543"
                                                />
                                                {errors.contactPhone && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {
                                                            errors.contactPhone
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="contactEmail">
                                                Contact Email *
                                            </Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                {...register("contactEmail")}
                                                placeholder="jane.smith@acme.com"
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
                                    </div>

                                    {/* Account Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">
                                            Account Information
                                        </h3>

                                        <div>
                                            <Label htmlFor="email">
                                                Login Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register("email")}
                                                placeholder="vendor@acme.com"
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
                                                        {...register(
                                                            "password"
                                                        )}
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
                                                        {
                                                            errors.password
                                                                .message
                                                        }
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
                                                            errors
                                                                .confirmPassword
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="firstName">
                                                    First Name (Optional)
                                                </Label>
                                                <Input
                                                    id="firstName"
                                                    {...register("firstName")}
                                                    placeholder="Jane"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="lastName">
                                                    Last Name (Optional)
                                                </Label>
                                                <Input
                                                    id="lastName"
                                                    {...register("lastName")}
                                                    placeholder="Smith"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    <div className="space-y-6">
                                        <AddressForm
                                            prefix="physicalAddress"
                                            title="Physical Address"
                                            required
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
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Creating Account..."
                                            : "Create Vendor Account"}
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
                                            Are you an employee?{" "}
                                            <Link
                                                href="/register/employee"
                                                className="font-medium text-blue-600 hover:text-blue-500"
                                            >
                                                Register as Employee
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </PublicRoute>
    );
}
