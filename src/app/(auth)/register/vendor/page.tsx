"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
    vendorRegistrationSchema,
    type VendorRegistrationFormData,
} from "@/lib/validations";
import { AddressForm } from "@/components/auth/AddressForm";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { AuthService } from "@/lib/services/auth";

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

export default function VendorRegisterPage() {
    const methods = useForm<VendorRegistrationFormData>({
        resolver: zodResolver(vendorRegistrationSchema),
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = methods;
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: VendorRegistrationFormData) => {
        setSubmitting(true);
        setError(null);
        try {
            await AuthService.registerVendor(data);
            router.push("/login?registered=1");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PublicRoute>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-3xl"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold">
                            Vendor Registration
                        </h1>
                        <p className="text-muted-foreground">
                            Submit your details for approval. You can update
                            information later.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Create Vendor Account</CardTitle>
                            <CardDescription>
                                Only vendors can self-register. Employees are
                                created by admins.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...methods}>
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    {error && (
                                        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                            {error}
                                        </div>
                                    )}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@company.com"
                                                {...register("email")}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                {...register("password")}
                                            />
                                            {errors.password && (
                                                <p className="text-sm text-destructive">
                                                    {errors.password.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">
                                                Confirm Password
                                            </Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                {...register("confirmPassword")}
                                            />
                                            {errors.confirmPassword && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        errors.confirmPassword
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">
                                                Company Name
                                            </Label>
                                            <Input
                                                id="companyName"
                                                {...register("companyName")}
                                            />
                                            {errors.companyName && (
                                                <p className="text-sm text-destructive">
                                                    {errors.companyName.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="website">
                                                Website
                                            </Label>
                                            <Input
                                                id="website"
                                                placeholder="https://"
                                                {...register("website")}
                                            />
                                            {errors.website && (
                                                <p className="text-sm text-destructive">
                                                    {errors.website.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contactName">
                                                Contact Name
                                            </Label>
                                            <Input
                                                id="contactName"
                                                {...register("contactName")}
                                            />
                                            {errors.contactName && (
                                                <p className="text-sm text-destructive">
                                                    {errors.contactName.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="servicesOffered">
                                                Services Offered (comma
                                                separated)
                                            </Label>
                                            <Input
                                                id="servicesOffered"
                                                placeholder="Consulting, IT Services"
                                                {...register(
                                                    "servicesOffered",
                                                    {
                                                        setValueAs: (v) =>
                                                            typeof v ===
                                                            "string"
                                                                ? v
                                                                      .split(
                                                                          ","
                                                                      )
                                                                      .map(
                                                                          (s) =>
                                                                              s.trim()
                                                                      )
                                                                      .filter(
                                                                          Boolean
                                                                      )
                                                                : v,
                                                    }
                                                )}
                                            />
                                            {errors.servicesOffered && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        errors.servicesOffered
                                                            .message as string
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contactEmail">
                                                Contact Email
                                            </Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                {...register("contactEmail")}
                                            />
                                            {errors.contactEmail && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        errors.contactEmail
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contactPhone">
                                                Contact Phone
                                            </Label>
                                            <Input
                                                id="contactPhone"
                                                {...register("contactPhone")}
                                            />
                                            {errors.contactPhone && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        errors.contactPhone
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <AddressForm
                                            prefix="physicalAddress"
                                            title="Physical Address"
                                            required
                                        />
                                        <AddressForm
                                            prefix="mailingAddress"
                                            title="Mailing Address"
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">
                                                First Name (optional)
                                            </Label>
                                            <Input
                                                id="firstName"
                                                {...register("firstName")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">
                                                Last Name (optional)
                                            </Label>
                                            <Input
                                                id="lastName"
                                                {...register("lastName")}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? "Submitting..."
                                            : "Submit Registration"}
                                    </Button>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </PublicRoute>
    );
}
