"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
        localStorage.setItem("theme", theme);
    } catch {}
}

function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || stored === "light") return stored;
    } catch {}
    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }
    return "light";
}

export function ThemeIconButton() {
    const [mounted, setMounted] = React.useState(false);
    const [theme, setTheme] = React.useState<Theme>("light");

    React.useEffect(() => {
        const initial = getInitialTheme();
        setTheme(initial);
        applyTheme(initial);
        setMounted(true);
    }, []);

    const toggle = React.useCallback(() => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            applyTheme(next);
            return next;
        });
    }, []);

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-pressed={theme === "dark"}
        >
            {mounted ? (
                theme === "dark" ? (
                    <Sun className="size-4" />
                ) : (
                    <Moon className="size-4" />
                )
            ) : (
                <Moon className="size-4" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
