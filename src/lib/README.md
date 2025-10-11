# Service Layer (src/lib)

This folder contains the client-side service layer for the JDC Management Portal and is aligned with the API exposed at http://localhost:4000/api.

Highlights

-   HTTP client: `api.ts` provides a typed wrapper with base URL `/api`, JWT attach, 401 refresh + retry, 429 backoff (Retry-After), request timeouts (default 20s), and normalized error mapping.
-   Auth/session: `session.ts` holds the access token (refresh is httpOnly cookie-driven). `services/auth.ts` implements login, refresh, profile, password, and admin account actions.
-   Domain services: `services/*` cover RBAC, users, employees, vendors, contracts, files, HR documents, notifications, and internal notes. Endpoints and DTOs reflect the OpenAPI under `/api`.
-   Realtime: `services/realtime.ts` derives WS base from `NEXT_PUBLIC_WS_URL` or `NEXT_PUBLIC_API_URL` (with `/api` suffix removed) and authenticates with the current access token.
-   Types: `types/*` define request/response DTOs and common envelopes like `PaginatedResponse` and the normalized `StandardError`.

Environment

-   `NEXT_PUBLIC_API_URL` defaults to `http://localhost:4000/api` (trailing slash removed at runtime).
-   `NEXT_PUBLIC_API_TIMEOUT_MS` (optional) overrides the default 20,000 ms request timeout.
-   `NEXT_PUBLIC_WS_URL` (optional) overrides the realtime WS base; otherwise derived from `NEXT_PUBLIC_API_URL` by stripping `/api`.

Migration notes for callers

-   Always use the services in `src/lib/services` rather than raw `fetch`.
-   Service functions return typed data matching server responses; error cases throw an `Error` augmented with `StandardError` fields (`code`, `message`, `status`, `requestId`, etc.). Catch and surface `message` and optionally `requestId`.
-   The API base now includes `/api`. If you previously constructed absolute URLs manually, switch to the service methods.

Known assumptions

-   Refresh token is httpOnly and handled via `/auth/refresh`. The client stores only the access token.
-   Error responses follow the standardized envelope: `{ error, message, requestId?, details?, fieldErrors? }`. The client maps this into `StandardError`.
