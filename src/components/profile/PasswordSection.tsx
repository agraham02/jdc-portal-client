"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/ui/password-input";
import { Lock } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passwordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(12, "Password must be at least 12 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
                "Password must contain uppercase, lowercase, number, and special character"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordSectionProps {
    onSubmit: (data: PasswordFormData) => Promise<void>;
    isSubmitting: boolean;
}

export function PasswordSection({
    onSubmit,
    isSubmitting,
}: PasswordSectionProps) {
    const {
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    });

    const handleFormSubmit = async (data: PasswordFormData) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Card className="p-6">
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">
                            Change Password
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Update your account password
                    </p>
                    <Separator className="mb-6" />
                </div>

                <div className="space-y-4 max-w-md">
                    <Controller
                        name="oldPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                {...field}
                                label={
                                    <>
                                        Current Password{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </>
                                }
                                placeholder="Enter current password"
                                id="oldPassword"
                                error={errors.oldPassword?.message}
                            />
                        )}
                    />
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                {...field}
                                label={
                                    <>
                                        New Password{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </>
                                }
                                placeholder="Enter new password"
                                id="newPassword"
                                showPasswordHint
                                error={errors.newPassword?.message}
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
                                        Confirm New Password{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </>
                                }
                                placeholder="Confirm new password"
                                id="confirmPassword"
                                error={errors.confirmPassword?.message}
                            />
                        )}
                    />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Changing Password..." : "Change Password"}
                </Button>
            </form>
        </Card>
    );
}
