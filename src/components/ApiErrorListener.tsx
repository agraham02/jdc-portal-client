"use client";
import { onApiError } from "@/lib/api-events";
import { useAuthz } from "@/lib/authz/useAuthz";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ApiErrorListener() {
    // Install a global API error listener to improve UX for 401/403
    const { refresh } = useAuthz();
    useEffect(() => {
        const off = onApiError(async ({ status, message, code }) => {
            if (code === "PASSWORD_CHANGE_REQUIRED") {
                // Account provisioned with a temporary password — force the
                // change-password flow before anything else can be used.
                if (
                    typeof window !== "undefined" &&
                    !window.location.pathname.startsWith("/profile/security")
                ) {
                    window.location.href = "/profile/security?forceChange=1";
                }
                return;
            }
            if (status === 401) {
                toast.error(message || "Session expired. Please sign in.");
            } else if (status === 403) {
                toast.error(message || "Not allowed.");
                // Permissions may have changed; refresh in background
                refresh().catch(() => {});
            }
        });
        return () => {
            off?.();
        };
    }, [refresh]);
    return null;
}
