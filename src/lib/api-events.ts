import type { StandardError } from "./types/errors";

export type ApiErrorDetail = StandardError & { status: number };

const EVENT_ERROR = "api:error";

export function emitApiError(detail: ApiErrorDetail) {
    if (typeof window === "undefined") return;
    const event = new CustomEvent<ApiErrorDetail>(EVENT_ERROR, { detail });
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
