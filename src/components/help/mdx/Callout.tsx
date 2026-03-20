"use client";

import { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";

type CalloutVariant = "info" | "warning" | "tip" | "success";

const variantConfig: Record<
    CalloutVariant,
    { icon: typeof Info; className: string }
> = {
    info: {
        icon: Info,
        className:
            "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 [&>svg]:text-blue-600",
    },
    warning: {
        icon: AlertTriangle,
        className:
            "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 [&>svg]:text-amber-600",
    },
    tip: {
        icon: Lightbulb,
        className:
            "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 [&>svg]:text-green-600",
    },
    success: {
        icon: CheckCircle,
        className:
            "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 [&>svg]:text-emerald-600",
    },
};

interface CalloutProps {
    variant?: CalloutVariant;
    title?: string;
    children: ReactNode;
}

export function Callout({
    variant = "info",
    title,
    children,
}: CalloutProps) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <Alert className={`my-4 ${config.className}`}>
            <Icon className="h-4 w-4" />
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
}
