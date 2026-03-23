import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { AuthorizationProvider } from "@/lib/authz/AuthorizationProvider";
import { Toaster } from "@/components/ui/sonner";
import ApiErrorListener from "@/components/ApiErrorListener";
import { ThemeScript } from "@/components/navigation/ThemeScript";
import { SWRProvider } from "@/lib/contexts/swr-config";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "JDC Portal",
    description: "JDC Portal — Contracts, HR, and Employee Management",
};

// TODO: if the user is signed in, "/" route should take user to dashboard page

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Set initial theme before paint to avoid FOUC */}
                <ThemeScript />
            </head>
            <body
                className={`${inter.variable} ${geistMono.variable} antialiased`}
            >
                <SWRProvider>
                    <AuthorizationProvider>
                        <AuthProvider>
                            <ApiErrorListener />
                            {children}
                        </AuthProvider>
                    </AuthorizationProvider>
                </SWRProvider>
                <Toaster richColors />
            </body>
        </html>
    );
}
