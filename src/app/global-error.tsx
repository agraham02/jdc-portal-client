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
                        <h1
                            style={{
                                fontSize: "32px",
                                fontWeight: "bold",
                                margin: 0,
                            }}
                        >
                            Critical Error
                        </h1>
                        <p
                            style={{
                                maxWidth: "500px",
                                color: "#666",
                                margin: 0,
                            }}
                        >
                            A critical error occurred and the application cannot
                            recover. Please refresh the page or contact support
                            if the problem persists.
                        </p>
                        {error.digest && (
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "#999",
                                    margin: 0,
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
                                padding: "10px 20px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#000",
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
                                padding: "10px 20px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                backgroundColor: "#fff",
                                color: "#000",
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
