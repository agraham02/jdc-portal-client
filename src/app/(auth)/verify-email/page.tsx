"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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

export default function VerifyEmailPage() {
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
            } catch (e: any) {
                setVerified(false);
                const msg =
                    e?.status === 404
                        ? "Email verification is not enabled in this environment. If you submitted a registration, please await approval."
                        : e?.message ||
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
                res?.message || "Verification email sent if account exists."
            );
            // Respect server rate limit hints if provided
            // Our api client also exposes Retry-After seconds as details.retryAfterSeconds
        } catch (e: any) {
            if (e?.status === 404) {
                setMessage(
                    "Email verification is not enabled in this environment. If you submitted a registration, please await approval."
                );
                return;
            }
            const retry = Number(e?.details?.retryAfterSeconds);
            if (!Number.isNaN(retry) && retry > 0) {
                setCooldown(retry);
                setMessage(
                    `Too many requests. Please try again in ${retry} seconds.`
                );
            } else {
                setMessage(
                    e?.message ||
                        "Could not resend verification. Try again later."
                );
            }
        } finally {
            setResending(false);
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
                        <CardTitle>Email Verification</CardTitle>
                        <CardDescription>
                            {hasToken
                                ? "Confirming your email address"
                                : "Enter your email to resend a verification link"}
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
        </div>
    );
}
