"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "motion/react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/services/auth";
import {
    ForgotPasswordFormData,
    forgotPasswordSchema,
} from "@/lib/validations";
import type { StandardError } from "@/lib/types/errors";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [devToken, setDevToken] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true);
        setSuccess(null);
        setError(null);
        try {
            const res = await AuthService.requestPasswordReset(data);
            setSuccess(
                res.message ||
                    "If an active account exists, a reset link will be sent.",
            );
            if (process.env.NODE_ENV !== "production" && res.token) {
                setDevToken(res.token);
            }
        } catch (e: unknown) {
            const std = (e ?? {}) as Partial<StandardError>;
            setError(
                typeof std.message === "string" && std.message.length > 0
                    ? std.message
                    : "Unable to process request right now. Please try again later.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            <motion.div variants={staggerItem} className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-4">
                    <KeyRound className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Forgot Password
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Enter your email to receive a reset link
                </p>
            </motion.div>

            <motion.div variants={staggerItem}>
                <Card>
                    <CardHeader>
                        <CardTitle>Reset Your Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="space-y-4">
                                <p className="text-sm">{success}</p>
                                {devToken && (
                                    <p className="text-xs text-muted-foreground">
                                        Dev shortcut:{" "}
                                        <Link
                                            className="text-primary underline"
                                            href={`/reset-password?token=${encodeURIComponent(
                                                devToken,
                                            )}`}
                                        >
                                            Reset now
                                        </Link>
                                    </p>
                                )}
                                <Link
                                    href="/login"
                                    className="text-primary hover:underline text-sm"
                                >
                                    Return to sign in
                                </Link>
                            </div>
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Sending…"
                                        : "Send reset link"}
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
        </motion.div>
    );
}
