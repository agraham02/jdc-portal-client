// Memory-only session management for maximum security
// Access tokens are stored in memory only (not in cookies/localStorage)
// Refresh tokens are handled automatically via httpOnly cookies

let accessToken: string | null = null;

export const session = {
    /**
     * Set access token in memory only (secure against XSS)
     */
    setAccessToken: (token: string) => {
        accessToken = token;
    },

    /**
     * Get access token from memory
     */
    getAccessToken: (): string | null => {
        return accessToken;
    },

    /**
     * Clear access token from memory
     */
    destroy: () => {
        accessToken = null;
    },

    /**
     * Check if user has a valid access token
     */
    hasValidToken: (): boolean => {
        return !!accessToken;
    },

    // Debug function for development only
    ...(process.env.NODE_ENV !== "production"
        ? {
              debug: () => ({
                  hasToken: !!accessToken,
                  tokenExists: accessToken ? "Yes" : "No",
                  // Don't log actual token value for security
              }),
          }
        : {}),
};
