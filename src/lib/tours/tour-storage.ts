const STORAGE_PREFIX = "jdc-tour-";

export function isTourCompleted(tourId: string): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`${STORAGE_PREFIX}${tourId}`) === "completed";
}

export function markTourCompleted(tourId: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${STORAGE_PREFIX}${tourId}`, "completed");
}

export function resetTour(tourId: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${STORAGE_PREFIX}${tourId}`);
}

export function resetAllTours(): void {
    if (typeof window === "undefined") return;
    const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(STORAGE_PREFIX)
    );
    for (const key of keys) {
        localStorage.removeItem(key);
    }
}

export function getCompletedTourIds(): string[] {
    if (typeof window === "undefined") return [];
    return Object.keys(localStorage)
        .filter(
            (k) =>
                k.startsWith(STORAGE_PREFIX) &&
                localStorage.getItem(k) === "completed"
        )
        .map((k) => k.replace(STORAGE_PREFIX, ""));
}
