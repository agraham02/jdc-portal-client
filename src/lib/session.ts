// Simple access token holder with sessionStorage (clears on tab close)
// Refresh token is stored in httpOnly cookie by the backend

const ACCESS_TOKEN_KEY = "jdc_access_token";

let memoryToken: string | null = null;

function getAccessToken(): string | null {
    if (typeof window === "undefined") return memoryToken;
    // Try memory first for performance, fall back to sessionStorage
    if (memoryToken) return memoryToken;

    const stored = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
        memoryToken = stored; // Cache in memory
    }
    return stored;
}

function setAccessToken(token: string | null) {
    memoryToken = token;
    if (typeof window !== "undefined") {
        if (token) {
            // Use sessionStorage instead of localStorage for better security
            // sessionStorage clears when the tab/window is closed
            window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        } else {
            window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        }
    }
}

function clear() {
    memoryToken = null;
    if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
}

export const session = {
    getAccessToken,
    setAccessToken,
    clear,
};
