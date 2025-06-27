import { parseCookies, setCookie, destroyCookie } from "nookies";

const ACCESS_TOKEN_KEY = "accessToken";

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
};
