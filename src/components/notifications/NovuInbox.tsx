"use client";

import { Inbox } from "@novu/nextjs";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";

export function NovuInbox() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    const applicationIdentifier = process.env.NEXT_PUBLIC_NOVU_APP_ID;

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
                    colorBackground: "hsl(var(--background))",
                    colorForeground: "hsl(var(--foreground))",
                    colorPrimary: "hsl(var(--primary))",
                    colorPrimaryForeground: "hsl(var(--primary-foreground))",
                    colorSecondary: "hsl(var(--secondary))",
                    colorSecondaryForeground:
                        "hsl(var(--secondary-foreground))",
                    colorNeutral: "hsl(var(--muted-foreground))",
                    colorCounter: "hsl(var(--destructive))",
                    colorCounterForeground:
                        "hsl(var(--destructive-foreground))",
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
