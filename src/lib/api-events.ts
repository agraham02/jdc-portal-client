import type { StandardError } from "./types/errors";

export type ApiErrorDetail = StandardError & { status: number };

// Event types for the API event system
export type ApiEventDetail = {
    "api:error": ApiErrorDetail;
    "api:auth:refresh": { success: boolean; token?: string };
    "api:auth:logout": { reason?: string };
    "api:retry": { attempt: number; maxAttempts: number; url: string };
};

const EVENT_ERROR = "api:error";
const EVENT_AUTH_REFRESH = "api:auth:refresh";
const EVENT_AUTH_LOGOUT = "api:auth:logout";
const EVENT_RETRY = "api:retry";

export function emitApiError(detail: ApiErrorDetail) {
    if (typeof window === "undefined") return;
    const event = new CustomEvent<ApiErrorDetail>(EVENT_ERROR, { detail });
    window.dispatchEvent(event);
}

export function emitAuthRefresh(detail: ApiEventDetail["api:auth:refresh"]) {
    if (typeof window === "undefined") return;
    const event = new CustomEvent(EVENT_AUTH_REFRESH, { detail });
    window.dispatchEvent(event);
}

export function emitAuthLogout(detail: ApiEventDetail["api:auth:logout"]) {
    if (typeof window === "undefined") return;
    const event = new CustomEvent(EVENT_AUTH_LOGOUT, { detail });
    window.dispatchEvent(event);
}

export function emitRetry(detail: ApiEventDetail["api:retry"]) {
    if (typeof window === "undefined") return;
    const event = new CustomEvent(EVENT_RETRY, { detail });
    window.dispatchEvent(event);
}

export function onApiError(listener: (detail: ApiErrorDetail) => void) {
    if (typeof window === "undefined") return () => {};
    const handler = (e: Event) => {
        const ce = e as CustomEvent<ApiErrorDetail>;
        listener(ce.detail);
    };
    window.addEventListener(EVENT_ERROR, handler as EventListener);
    return () =>
        window.removeEventListener(EVENT_ERROR, handler as EventListener);
}

export function onAuthRefresh(
    listener: (detail: ApiEventDetail["api:auth:refresh"]) => void
) {
    if (typeof window === "undefined") return () => {};
    const handler = (e: Event) => {
        const ce = e as CustomEvent<ApiEventDetail["api:auth:refresh"]>;
        listener(ce.detail);
    };
    window.addEventListener(EVENT_AUTH_REFRESH, handler as EventListener);
    return () =>
        window.removeEventListener(
            EVENT_AUTH_REFRESH,
            handler as EventListener
        );
}

export function onAuthLogout(
    listener: (detail: ApiEventDetail["api:auth:logout"]) => void
) {
    if (typeof window === "undefined") return () => {};
    const handler = (e: Event) => {
        const ce = e as CustomEvent<ApiEventDetail["api:auth:logout"]>;
        listener(ce.detail);
    };
    window.addEventListener(EVENT_AUTH_LOGOUT, handler as EventListener);
    return () =>
        window.removeEventListener(EVENT_AUTH_LOGOUT, handler as EventListener);
}

export function onRetry(
    listener: (detail: ApiEventDetail["api:retry"]) => void
) {
    if (typeof window === "undefined") return () => {};
    const handler = (e: Event) => {
        const ce = e as CustomEvent<ApiEventDetail["api:retry"]>;
        listener(ce.detail);
    };
    window.addEventListener(EVENT_RETRY, handler as EventListener);
    return () =>
        window.removeEventListener(EVENT_RETRY, handler as EventListener);
}
