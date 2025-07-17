import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Parses a comma-separated string into an array of trimmed strings,
 * filtering out empty values. Returns undefined if input is empty.
 *
 * @param commaSeparatedString - The comma-separated string to parse
 * @returns Array of strings or undefined if input is empty
 */
export function parseCommaSeparatedString(
    commaSeparatedString?: string
): string[] | undefined {
    if (!commaSeparatedString?.trim()) {
        return undefined;
    }

    const parsed = commaSeparatedString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    return parsed.length > 0 ? parsed : undefined;
}
