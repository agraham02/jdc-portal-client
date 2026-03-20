"use client";

import { ReactNode } from "react";

interface KeyboardShortcutProps {
    children: ReactNode;
}

export function KeyboardShortcut({ children }: KeyboardShortcutProps) {
    return (
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            {children}
        </kbd>
    );
}
