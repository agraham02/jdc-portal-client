import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to handle root path redirects based on authentication status
 *
 * - Authenticated users: Redirect / to /dashboard
 * - Unauthenticated users: Redirect / to /login
 *
 * Authentication is detected via the presence of accessToken cookie
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only handle root path
    if (pathname !== "/") {
        return NextResponse.next();
    }

    // Check for authentication via cookie and validate JWT
    const accessToken = request.cookies.get("accessToken");

    if (accessToken?.value) {
        try {
            // Dynamically import the JWT library to avoid issues in edge runtime
            const { jwtVerify } = await import("jose");
            const secret = new TextEncoder().encode(
                process.env.NEXT_PUBLIC_JWT_SECRET || ""
            );
            // Verify the token (throws if invalid/expired)
            await jwtVerify(accessToken.value, secret);

            // Authenticated: redirect to dashboard
            return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch {
            // Invalid or expired token: redirect to login
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Unauthenticated: redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
}

// Configure middleware to only run on root path
export const config = {
    matcher: "/",
};
