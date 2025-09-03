"use client";

// TODO: delete file
import * as React from "react";

interface ToastProps {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
}

interface ToastContextValue {
    toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
    undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const toast = React.useCallback(
        ({ title, description, variant = "default" }: ToastProps) => {
            // For now, we'll use a simple alert. In a real app, you'd implement a proper toast system
            const message = description ? `${title}: ${description}` : title;
            if (variant === "destructive") {
                console.error(message);
                alert(`Error: ${message}`);
            } else {
                console.log(message);
                alert(message);
            }
        },
        []
    );

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
