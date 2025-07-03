import { parseCookies, setCookie, destroyCookie } from "nookies";

const ACCESS_TOKEN_KEY = "accessToken";

// Debug function to check all cookies
const debugCookies = () => {
    const cookies = parseCookies();
    console.log("All available cookies:", cookies);
    return cookies;
};

export const session = {
    setAccessToken: (accessToken: string) => {
        setCookie(null, ACCESS_TOKEN_KEY, accessToken, {
            // A shorter lifespan for access tokens is a good practice
            maxAge: 15 * 60, // 15 minutes
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
    },

    getAccessToken: () => {
        const cookies = parseCookies();
        return cookies[ACCESS_TOKEN_KEY];
    },

    destroy: () => {
        destroyCookie(null, ACCESS_TOKEN_KEY, { path: "/" });
    },

    ...(process.env.NODE_ENV !== "production" && { debugCookies }),
};
