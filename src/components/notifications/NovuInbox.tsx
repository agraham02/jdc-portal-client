"use client";

import { Inbox } from "@novu/nextjs";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";

export function NovuInbox() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    const applicationIdentifier =
        process.env.NEXT_PUBLIC_NOVU_APP_ID;

    if (!applicationIdentifier) {
        if (process.env.NODE_ENV === "development") {
            console.warn(
                "[NovuInbox] NEXT_PUBLIC_NOVU_APP_ID is not configured"
            );
        }
        return null;
    }

    return (
        <Inbox
            applicationIdentifier={applicationIdentifier}
            subscriberId={user._id}
            appearance={{
                variables: {
                    colorBackground: "oklch(0.145 0 0)",
                    colorForeground: "oklch(0.985 0 0)",
                    colorPrimary: "oklch(0.922 0 0)",
                    colorPrimaryForeground: "oklch(0.205 0 0)",
                    colorSecondary: "oklch(0.269 0 0)",
                    colorSecondaryForeground: "oklch(0.985 0 0)",
                    colorNeutral: "oklch(0.708 0 0)",
                    colorCounter: "oklch(0.704 0.191 22.216)",
                    colorCounterForeground: "oklch(0.985 0 0)",
                    fontSize: "14px",
                },
            }}
            onNotificationClick={(notification) => {
                const redirectUrl = notification.redirect?.url;
                if (redirectUrl) {
                    if (redirectUrl.startsWith("/")) {
                        router.push(redirectUrl);
                    } else {
                        window.location.href = redirectUrl;
                    }
                }
            }}
        />
    );
}
