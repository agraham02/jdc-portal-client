"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { MailCheck } from "lucide-react";
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
import { AuthService } from "@/lib/services/auth";
import { staggerContainer, staggerItem } from "@/lib/animations";

function VerifyEmailInner() {
    const sp = useSearchParams();
    const token = sp?.get("token") || "";
    const hasToken = useMemo(() => !!token, [token]);

    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState<null | boolean>(null);
    const [message, setMessage] = useState<string>("");
    const [email, setEmail] = useState("");
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState<number | null>(null);

    useEffect(() => {
        if (!hasToken) return;
        const run = async () => {
            setVerifying(true);
            setVerified(null);
            setMessage("");
            try {
                const res = await AuthService.verifyEmail(token);
                setVerified(true);
                setMessage(res?.message || "Email verified successfully.");
            } catch (e: unknown) {
                setVerified(false);
                const anyErr = e as { status?: number; message?: unknown };
                const msg =
                    anyErr?.status === 404
                        ? "Email verification is not enabled in this environment. If you submitted a registration, please await approval."
                        : (typeof anyErr?.message === "string"
                              ? anyErr.message
                              : undefined) ||
                          "Verification failed. The link may be expired or already used.";
                setMessage(msg);
            } finally {
                setVerifying(false);
            }
        };
        run();
    }, [hasToken, token]);

    useEffect(() => {
        if (cooldown == null) return;
        if (cooldown <= 0) return;
        const id = setInterval(() => setCooldown((s) => (s ? s - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, [cooldown]);

    const onResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setResending(true);
        setMessage("");
        try {
            const res = await AuthService.resendVerification(email);
            setMessage(
                res?.message || "Verification email sent if account exists.",
            );
            // Respect server rate limit hints if provided
            // Our api client also exposes Retry-After seconds as details.retryAfterSeconds
        } catch (e: unknown) {
            const anyErr = e as {
                status?: number;
                details?: { retryAfterSeconds?: unknown };
                message?: unknown;
            };
            if (anyErr?.status === 404) {
                setMessage(
                    "Email verification is not enabled in this environment. If you submitted a registration, please await approval.",
                );
                return;
            }
            const retry = Number(anyErr?.details?.retryAfterSeconds);
            if (!Number.isNaN(retry) && retry > 0) {
                setCooldown(retry);
                setMessage(
                    `Too many requests. Please try again in ${retry} seconds.`,
                );
            } else {
                setMessage(
                    (typeof anyErr?.message === "string"
                        ? anyErr.message
                        : undefined) ||
                        "Could not resend verification. Try again later.",
                );
            }
        } finally {
            setResending(false);
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
                    <MailCheck className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Email Verification
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {hasToken
                        ? "Confirming your email address"
                        : "Enter your email to resend a verification link"}
                </p>
            </motion.div>

            <motion.div variants={staggerItem}>
                <Card>
                    <CardHeader>
                        <CardTitle>Verify Email</CardTitle>
                        <CardDescription>
                            {hasToken
                                ? "We're confirming your email address"
                                : "Request a new verification link"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hasToken ? (
                            <div className="space-y-2">
                                <p className="text-sm">
                                    {verifying
                                        ? "Verifying your email..."
                                        : message ||
                                          (verified
                                              ? "Your email has been verified. You may sign in now."
                                              : "Verification failed. Request a new link below.")}
                                </p>
                                {!verifying && verified === false && (
                                    <form
                                        onSubmit={onResend}
                                        className="space-y-3"
                                    >
                                        <div className="space-y-1">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={resending || !!cooldown}
                                        >
                                            {cooldown
                                                ? `Try again in ${cooldown}s`
                                                : resending
                                                  ? "Sending..."
                                                  : "Resend verification"}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={onResend} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                {message && (
                                    <p className="text-sm text-muted-foreground">
                                        {message}
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    disabled={resending || !!cooldown}
                                >
                                    {cooldown
                                        ? `Try again in ${cooldown}s`
                                        : resending
                                          ? "Sending..."
                                          : "Send verification link"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center p-4">
                    Loading…
                </div>
            }
        >
            <VerifyEmailInner />
        </Suspense>
    );
}
