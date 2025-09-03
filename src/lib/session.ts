// Simple access token holder with localStorage persistence (not for refresh token)

const ACCESS_TOKEN_KEY = "jdc_access_token";

let memoryToken: string | null = null;

function getAccessToken(): string | null {
    if (typeof window === "undefined") return memoryToken;
    return memoryToken ?? window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function setAccessToken(token: string | null) {
    memoryToken = token;
    if (typeof window !== "undefined") {
        if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
        else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
}

function clear() {
    setAccessToken(null);
}

export const session = {
    getAccessToken,
    setAccessToken,
    clear,
};
