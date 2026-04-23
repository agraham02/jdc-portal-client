"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // If already signed in, redirect away from auth pages
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Left — Branding panel (hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/15">
                        <Building2 className="h-5 w-5" />
                    </div>
                    JDC Portal
                </div>
                <div className="space-y-2">
                    <blockquote className="text-lg font-medium leading-relaxed">
                        &ldquo;Streamline your procurement, manage your team,
                        and grow your business — all in one place.&rdquo;
                    </blockquote>
                    <p className="text-sm text-primary-foreground/70">
                        JDC Management Portal
                    </p>
                </div>
                <p className="text-xs text-primary-foreground/50">
                    &copy; {new Date().getFullYear()} JDC. All rights reserved.
                </p>
            </div>

            {/* Right — Auth form */}
            <div className="flex items-center justify-center bg-background p-6 sm:p-10 overflow-y-auto">
                <div className="w-full max-w-lg">{children}</div>
            </div>
        </div>
    );
}
