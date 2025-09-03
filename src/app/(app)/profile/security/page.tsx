"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/lib/services/auth";
import {
    ChangePasswordFormData,
    changePasswordSchema,
} from "@/lib/validations";
import type { StandardError } from "@/lib/types/errors";
import PasswordPolicyHints from "@/components/auth/PasswordPolicyHints";

export default function SecurityPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });
    const newPassword = watch("newPassword") || "";

    const onSubmit = async (data: ChangePasswordFormData) => {
        setIsSubmitting(true);
        setSuccess(null);
        setError(null);
        try {
            const res = await AuthService.changePassword(data);
            setSuccess(res.message || "Password updated successfully.");
            reset();
        } catch (e: unknown) {
            const std = (e ?? {}) as Partial<StandardError>;
            if (
                std.status === 401 &&
                /old password/i.test(String(std.message))
            ) {
                setError("Current password is incorrect.");
            } else {
                setError(
                    typeof std.message === "string" && std.message.length > 0
                        ? std.message
                        : "Unable to update password right now."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-xl"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            {success && (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    {success} All sessions were logged out for
                                    security.
                                </p>
                            )}
                            {error && (
                                <p className="text-sm text-destructive">
                                    {error}
                                </p>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword">
                                    Current password
                                </Label>
                                <Input
                                    id="oldPassword"
                                    type="password"
                                    {...register("oldPassword")}
                                />
                                {errors.oldPassword && (
                                    <p className="text-sm text-destructive">
                                        {errors.oldPassword.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">
                                    New password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    {...register("newPassword")}
                                />
                                <PasswordPolicyHints password={newPassword} />
                                {errors.newPassword && (
                                    <p className="text-sm text-destructive">
                                        {errors.newPassword.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm new password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating…" : "Update password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
