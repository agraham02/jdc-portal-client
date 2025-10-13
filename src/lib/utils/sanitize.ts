import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify to strip dangerous tags and attributes
 */
export function sanitizeHtml(dirty: string): string {
    if (typeof window === "undefined") {
        // Server-side: return as-is (sanitization happens client-side)
        return dirty;
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            "p",
            "br",
            "strong",
            "em",
            "u",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "ul",
            "ol",
            "li",
            "a",
            "blockquote",
            "code",
            "pre",
        ],
        ALLOWED_ATTR: ["href", "title", "target", "rel"],
        ALLOW_DATA_ATTR: false,
        // Force all links to open in new tab and be noopener noreferrer
        ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
    });
}

/**
 * Strip all HTML tags from a string, leaving only text
 * Useful for plain text display or previews
 */
export function stripHtml(html: string): string {
    if (typeof window === "undefined") {
        // Server-side: basic regex strip
        return html.replace(/<[^>]*>/g, "");
    }

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
}

/**
 * Sanitize user input for safe display
 * More restrictive than sanitizeHtml - only allows basic formatting
 */
export function sanitizeUserContent(dirty: string): string {
    if (typeof window === "undefined") {
        return dirty;
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ["p", "br", "strong", "em", "u"],
        ALLOWED_ATTR: [],
        ALLOW_DATA_ATTR: false,
    });
}
