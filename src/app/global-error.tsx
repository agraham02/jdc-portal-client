"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log critical unrecoverable error
        console.error("[Global Error - Unrecoverable]", error);

        // TODO: Send to error tracking service
        // This is the last resort error boundary
    }, [error]);

    return (
        <html>
            <body>
                <div
                    style={{
                        display: "flex",
                        minHeight: "100vh",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "24px",
                        padding: "16px",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        background: "#fafafa",
                        color: "#111",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "50%",
                                backgroundColor: "#fee2e2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#dc2626"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                                <path d="M12 9v4" />
                                <path d="M12 17h.01" />
                            </svg>
                        </div>
                        <h1
                            style={{
                                fontSize: "28px",
                                fontWeight: "700",
                                margin: 0,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Critical Error
                        </h1>
                        <p
                            style={{
                                maxWidth: "440px",
                                color: "#555",
                                margin: 0,
                                lineHeight: "1.6",
                                fontSize: "15px",
                            }}
                        >
                            A critical error occurred and the application cannot
                            recover. Please refresh the page or contact support
                            if the problem persists.
                        </p>
                        {error.digest && (
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "#999",
                                    margin: 0,
                                    fontFamily: "monospace",
                                }}
                            >
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={reset}
                            style={{
                                padding: "10px 24px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#111",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => (window.location.href = "/")}
                            style={{
                                padding: "10px 24px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                backgroundColor: "#fff",
                                color: "#111",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                            }}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
