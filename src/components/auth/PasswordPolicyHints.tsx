"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants/auth";
import React from "react";

type Props = {
    password: string;
    className?: string;
    minLength?: number;
};

const defaultMin = PASSWORD_MIN_LENGTH;

export function PasswordPolicyHints({ password, className, minLength }: Props) {
    const min =
        typeof minLength === "number" && minLength > 0 ? minLength : defaultMin;

    const checks = React.useMemo(() => {
        const val = password || "";
        return [
            {
                key: "len",
                label: `At least ${min} characters`,
                met: val.length >= min,
            },
            {
                key: "lower",
                label: "At least one lowercase letter",
                met: /[a-z]/.test(val),
            },
            {
                key: "upper",
                label: "At least one uppercase letter",
                met: /[A-Z]/.test(val),
            },
            { key: "num", label: "At least one number", met: /\d/.test(val) },
            {
                key: "special",
                label: "At least one special character",
                met: /[^A-Za-z0-9]/.test(val),
            },
        ] as Array<{ key: string; label: string; met: boolean }>;
    }, [password, min]);

    // Lightweight strength scoring: number of requirements met plus proportional length credit
    const score = React.useMemo(() => {
        const metCount = checks.filter((c) => c.met).length;
        const lengthFactor = Math.min(1, (password?.length || 0) / (min * 1.5));
        // Weighted: requirements 80%, length factor 20%
        const normalized = Math.min(
            1,
            (metCount / checks.length) * 0.8 + lengthFactor * 0.2
        );
        return normalized; // 0..1
    }, [checks, password, min]);

    const barColor =
        score < 0.35
            ? "bg-red-500"
            : score < 0.7
            ? "bg-amber-500"
            : "bg-emerald-600";

    return (
        <div className={cn("mt-2", className)} aria-live="polite">
            {/* Subtle strength meter */}
            <div className="mb-1" aria-hidden="true">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-300 ease-out",
                            barColor
                        )}
                        style={{
                            width: `${Math.max(4, Math.round(score * 100))}%`,
                        }}
                    />
                </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
                Password requirements:
            </p>
            <ul className="space-y-1">
                {checks.map((c) => (
                    <li key={c.key} className="flex items-center gap-2 text-xs">
                        {c.met ? (
                            <Check
                                className="h-3.5 w-3.5 text-emerald-600"
                                aria-hidden="true"
                            />
                        ) : (
                            <X
                                className="h-3.5 w-3.5 text-muted-foreground"
                                aria-hidden="true"
                            />
                        )}
                        <span
                            className={cn(
                                c.met
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-muted-foreground"
                            )}
                        >
                            {c.label}
                            <span className="sr-only">
                                {c.met
                                    ? " - Requirement met"
                                    : " - Requirement not met"}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PasswordPolicyHints;
