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
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only handle root path
    if (pathname !== "/") {
        return NextResponse.next();
    }

    // Check for authentication via cookie
    const accessToken = request.cookies.get("accessToken");

    if (accessToken?.value) {
        // Authenticated: redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Unauthenticated: redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
}

// Configure middleware to only run on root path
export const config = {
    matcher: "/",
};
