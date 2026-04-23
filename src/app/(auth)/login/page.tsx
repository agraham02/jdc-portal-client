"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, AlertCircle, RotateCcw } from "lucide-react";
import { AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { LoginFormData, loginSchema } from "@/lib/validations";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import type { StandardError } from "@/lib/types/errors";
import { PasswordInput } from "@/components/ui/password-input";

function LoginInner() {
    const { login, reinstate } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | undefined>();
    const [rememberMe, setRememberMe] = useState(false);
    const [reinstatePrompt, setReinstatePrompt] = useState<{
        email: string;
        password: string;
        scheduledFor?: string;
    } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);
        setRequestId(undefined);
        setReinstatePrompt(null);

        try {
            const user = await login(data);

            if (!user) {
                throw new Error("Invalid email or password");
            }
            router.push("/dashboard");
        } catch (e: unknown) {
            // Map backend standard errors to friendly messages
            const std = (e ?? {}) as Partial<StandardError>;
            setRequestId(std.requestId);
            if (std.code === "REINSTATEMENT_AVAILABLE") {
                const scheduledFor =
                    (std.details?.deletionScheduledFor as string | undefined) ??
                    undefined;
                setReinstatePrompt({
                    email: data.email,
                    password: data.password,
                    scheduledFor,
                });
            } else if (
                std.status === 401 &&
                /locked|temporarily/i.test(String(std.message))
            ) {
                setError(
                    "Your account is temporarily locked due to failed sign-in attempts. Please try again later.",
                );
            } else if (
                std.status === 403 &&
                /not active|inactive/i.test(String(std.message))
            ) {
                setError(
                    "Your account is not active. If this is unexpected, contact an administrator.",
                );
            } else if (
                typeof std.message === "string" &&
                std.message.length > 0
            ) {
                setError(std.message);
            } else if (e instanceof Error) {
                setError(e.message || "Login failed. Please try again.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onConfirmReinstate = async () => {
        if (!reinstatePrompt) return;
        setIsLoading(true);
        setError(null);
        setRequestId(undefined);
        try {
            const user = await reinstate({
                email: reinstatePrompt.email,
                password: reinstatePrompt.password,
            });
            if (!user) throw new Error("Reinstatement failed");
            setReinstatePrompt(null);
            router.push("/dashboard");
        } catch (e: unknown) {
            const std = (e ?? {}) as Partial<StandardError>;
            setRequestId(std.requestId);
            setError(
                std.message ||
                    (e instanceof Error ? e.message : "Reinstatement failed"),
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Demo credential autofill handler
    const autofill = (email: string, password: string) => {
        // Use reset to properly update all fields including those registered via custom components
        reset(
            {
                email,
                password,
            },
            {
                keepErrors: false,
                keepDirty: false,
                keepIsSubmitted: false,
                keepTouched: false,
                keepIsValid: false,
                keepSubmitCount: false,
            },
        );
    };

    const registeredBanner = useMemo(
        () => searchParams?.get("registered") === "1",
        [searchParams],
    );

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            {/* Header */}
            <motion.div variants={staggerItem} className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4 shadow-sm">
                    <Building2 className="w-7 h-7 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Welcome Back
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Sign in to your JDC Portal account
                </p>
            </motion.div>

            <motion.div variants={staggerItem}>
                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <AnimatePresence mode="popLayout">
                                {reinstatePrompt && (
                                    <motion.div
                                        key="reinstate-banner"
                                        variants={fadeInUp}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="p-4 text-sm rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/50 space-y-3"
                                    >
                                        <div className="flex items-start gap-2">
                                            <RotateCcw className="w-4 h-4 mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" />
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium text-amber-900 dark:text-amber-200">
                                                    This account is scheduled
                                                    for deletion
                                                </p>
                                                <p className="text-amber-800/90 dark:text-amber-300/90">
                                                    {reinstatePrompt.scheduledFor
                                                        ? `It will be permanently removed on ${new Date(
                                                              reinstatePrompt.scheduledFor,
                                                          ).toLocaleDateString()}.`
                                                        : "It will be permanently removed soon."}{" "}
                                                    Reactivate it now to keep
                                                    your data and continue using
                                                    the portal.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={onConfirmReinstate}
                                                disabled={isLoading}
                                            >
                                                <RotateCcw className="w-4 h-4 mr-1" />
                                                Reactivate Account
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setReinstatePrompt(null)
                                                }
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                                {registeredBanner && (
                                    <motion.div
                                        key="registered-banner"
                                        variants={fadeInUp}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="p-3 text-sm rounded-lg border bg-muted"
                                    >
                                        Registration submitted. Once approved,
                                        you can sign in using your email and
                                        password.
                                    </motion.div>
                                )}
                                {error && (
                                    <motion.div
                                        key="error-banner"
                                        variants={fadeInUp}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <div className="flex-1">
                                            <div>{error}</div>
                                            {requestId && (
                                                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                                                    <span>Request ID:</span>
                                                    <code className="select-all bg-muted/30 px-2 py-0.5 rounded text-[11px]">
                                                        {requestId}
                                                    </code>
                                                    <Button
                                                        type="button"
                                                        variant="link"
                                                        size="sm"
                                                        className="text-primary text-xs h-auto p-0"
                                                        onClick={() =>
                                                            navigator.clipboard?.writeText(
                                                                String(
                                                                    requestId,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Copy
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    autoComplete="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <PasswordInput
                                        {...field}
                                        label="Password"
                                        id="password"
                                        error={errors.password?.message}
                                    />
                                )}
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(v) =>
                                            setRememberMe(Boolean(v))
                                        }
                                        aria-label="Remember me"
                                    />
                                    <Label htmlFor="remember" className="m-0">
                                        Remember me
                                    </Label>
                                </div>

                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                aria-live="polite"
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="text-primary hover:underline"
                                >
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Demo Credentials - Only show in development */}
            {process.env.NODE_ENV === "development" && (
                <motion.div variants={staggerItem}>
                    <Card className="mt-4 border-dashed">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">
                                Demo Credentials
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex flex-col items-start p-3"
                                    onClick={() =>
                                        autofill(
                                            process.env
                                                .NEXT_PUBLIC_ADMIN_EMAIL || "",
                                            process.env
                                                .NEXT_PUBLIC_ADMIN_PASSWORD ||
                                                "",
                                        )
                                    }
                                >
                                    <span className="font-medium">Admin</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex flex-col items-start p-3"
                                    onClick={() =>
                                        autofill(
                                            "employee@jdc.com",
                                            "Password123!",
                                        )
                                    }
                                >
                                    <span className="font-medium">
                                        Employee
                                    </span>
                                    <small className="text-muted-foreground">
                                        employee@jdc.com
                                    </small>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex flex-col items-start p-3"
                                    onClick={() =>
                                        autofill(
                                            "vendor.test@jdc.com",
                                            "Password123!",
                                        )
                                    }
                                >
                                    <span className="font-medium">Vendor</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center p-4">
                    Loading…
                </div>
            }
        >
            <LoginInner />
        </Suspense>
    );
}
