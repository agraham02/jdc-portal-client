export type ApiErrorDetail = {
    status: number;
    message?: string;
    path?: string;
};

const EVENT_NAME = "api:error";

export function emitApiError(detail: ApiErrorDetail) {
    if (typeof window === "undefined") return;
    const event = new CustomEvent<ApiErrorDetail>(EVENT_NAME, { detail });
    window.dispatchEvent(event);
}

export function onApiError(listener: (detail: ApiErrorDetail) => void) {
    if (typeof window === "undefined") return () => {};
    const handler = (e: Event) => {
        const ce = e as CustomEvent<ApiErrorDetail>;
        listener(ce.detail);
    };
    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () =>
        window.removeEventListener(EVENT_NAME, handler as EventListener);
}
