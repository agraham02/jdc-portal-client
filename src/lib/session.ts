// Memory-only session management for maximum security
// Access tokens are stored in memory only (not in cookies/localStorage)
// Refresh tokens are handled automatically via httpOnly cookies

let accessToken: string | null = null;

// const DEBUG_ENABLED =
//     process.env.NODE_ENV !== "production" ||
//     process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";
const DEBUG_ENABLED = true;

function debugLog(message: string, data?: unknown) {
    if (!DEBUG_ENABLED) return;
    console.log(`[SESSION DEBUG] ${message}`, data || "");
}

export const session = {
    /**
     * Set access token in memory only (secure against XSS)
     */
    setAccessToken: (token: string) => {
        debugLog(
            "Setting access token",
            token ? "Token present" : "Token null"
        );
        accessToken = token;
    },

    /**
     * Get access token from memory
     */
    getAccessToken: (): string | null => {
        debugLog(
            "Getting access token",
            accessToken ? "Token present" : "Token null"
        );
        return accessToken;
    },

    /**
     * Clear access token from memory
     */
    destroy: () => {
        debugLog("Destroying session");
        accessToken = null;
    },

    /**
     * Check if user has a valid access token
     */
    hasValidToken: (): boolean => {
        const hasToken = !!accessToken;
        debugLog("Checking if has valid token", hasToken);
        return hasToken;
    },

    // Debug function for development only
    ...(DEBUG_ENABLED
        ? {
              debug: () => {
                  const debugInfo = {
                      hasToken: !!accessToken,
                      tokenExists: accessToken ? "Yes" : "No",
                      tokenLength: accessToken ? accessToken.length : 0,
                      // Don't log actual token value for security
                  };
                  debugLog("Session debug info", debugInfo);
                  return debugInfo;
              },
          }
        : {}),
};
