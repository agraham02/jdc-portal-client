"use client";

import { Suspense, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/services/auth";
import { ResetPasswordFormData, resetPasswordSchema } from "@/lib/validations";
import type { StandardError } from "@/lib/types/errors";
import PasswordPolicyHints from "@/components/auth/PasswordPolicyHints";

function ResetPasswordInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = useMemo(
        () => searchParams?.get("token") || "",
        [searchParams]
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });
    const newPassword = watch("newPassword") || "";

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsSubmitting(true);
        setSuccess(null);
        setError(null);
        try {
            if (!token) {
                setError("Missing or invalid reset token.");
                return;
            }
            const res = await AuthService.confirmPasswordReset(token, data);
            setSuccess(res.message || "Password reset successful.");
            reset();
            // Redirect to login after a short delay
            setTimeout(() => router.push("/login"), 1500);
        } catch (e: unknown) {
            const std = (e ?? {}) as Partial<StandardError>;
            setError(
                typeof std.message === "string" && std.message.length > 0
                    ? std.message
                    : "Unable to reset password. Your link may be invalid or expired."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <CardTitle>Reset Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!token ? (
                            <div className="space-y-4">
                                <p className="text-sm">
                                    Missing token. Please use the link from your
                                    email.
                                </p>
                                <Link
                                    href="/forgot-password"
                                    className="text-primary hover:underline text-sm"
                                >
                                    Request a new link
                                </Link>
                            </div>
                        ) : success ? (
                            <p className="text-sm">{success}</p>
                        ) : (
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                {error && (
                                    <p className="text-sm text-destructive">
                                        {error}
                                    </p>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">
                                        New password
                                    </Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...register("newPassword")}
                                    />
                                    <PasswordPolicyHints
                                        password={newPassword}
                                    />
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
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Resetting…"
                                        : "Reset password"}
                                </Button>
                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Back to login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center p-4">
                    Loading…
                </div>
            }
        >
            <ResetPasswordInner />
        </Suspense>
    );
}
