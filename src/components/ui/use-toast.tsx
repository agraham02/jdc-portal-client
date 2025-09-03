"use client";

// Deprecated: we now use `toast` from 'sonner' directly. This shim avoids breaking legacy imports.
// Prefer: import { toast } from "sonner";
// This file may be removed once all references are migrated.

import React from "react";
export { toast } from "sonner";

export function ToastProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function useToast() {
    // Simple shim to match old API shape
    const { toast } = require("sonner");
    return { toast } as { toast: (opts: any) => void };
}
