const STORAGE_PREFIX = "jdc-tour-";

export function isTourCompleted(tourId: string): boolean {
    if (typeof window === "undefined") return false;
    try {
        return (
            localStorage.getItem(`${STORAGE_PREFIX}${tourId}`) === "completed"
        );
    } catch {
        return false;
    }
}

export function markTourCompleted(tourId: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${tourId}`, "completed");
    } catch {
        // Silently ignore quota / SecurityError in restricted browsing modes
    }
}

export function resetTour(tourId: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${tourId}`);
    } catch {
        // Silently ignore in restricted browsing modes
    }
}

export function resetAllTours(): void {
    if (typeof window === "undefined") return;
    try {
        const keys = Object.keys(localStorage).filter((k) =>
            k.startsWith(STORAGE_PREFIX),
        );
        for (const key of keys) {
            localStorage.removeItem(key);
        }
    } catch {
        // Silently ignore quota / SecurityError in restricted browsing modes
    }
}

export function getCompletedTourIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
        return Object.keys(localStorage)
            .filter(
                (k) =>
                    k.startsWith(STORAGE_PREFIX) &&
                    localStorage.getItem(k) === "completed",
            )
            .map((k) => k.replace(STORAGE_PREFIX, ""));
    } catch {
        return [];
    }
}
