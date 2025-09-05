# Delivery Plan

This plan organizes frontend delivery into independent, production-ready features. Each feature is implemented on its own branch (feature/<feature-name>), mapped to one or more User Stories from `User_Stories.md`, and delivered via small commits. All commits use imperative, descriptive messages and must pass CI (lint, typecheck) before merge.

---

## Foundation and Infrastructure

### [x] Feature: Design System & Theming

-   Branch: `feature/design-system-setup`
-   User Stories: Non-functional (Design philosophy, Dark Mode), Compatibility & changes
-   Goal: Establish Tailwind CSS v4, shadcn/ui, dark/light theme toggle, responsive base layout components.

#### Commits

1. `init tailwind v4 and base styles`
    - Configure Tailwind v4, globals, tokens, and responsive base.
2. `install shadcn/ui and scaffold ui primitives`
    - Add Button, Input, Dialog, Card, Table, Alert components.
3. `add dark mode support and theme toggle`
    - Implement theme provider and toggle; persist preference.
4. `implement responsive app shell scaffold`
    - Header, sidebar, content area; mobile nav.
5. `docs: add design system usage guidelines`
    - Document patterns in README.

**Completion Criteria:** The app renders with shadcn/ui and Tailwind v4, supports dark/light themes

---

### [x] Feature: API Client, Error Envelope, and Observability

-   Branch: `feature/api-client-and-errors`
-   User Stories: Standard errors; Observability; Rate limits & fair use; Compatibility & changes
-   Goal: Create a typed API client with consistent error handling per standard error envelope and client-side tracing.

#### Commits

1. `add typed api client with auth interceptor`
    - Base URL, auth header, refresh flow stubs.
2. `implement standard error parser and toasts`
    - Parse code, message, requestId, details, fieldErrors; show helpful UI.
3. `add request tracing and logging hooks`
    - Generate client requestId; propagate headers; console-safe logging.
4. `implement 429 handling with backoff`
    - Show retry-after UI; automatic limited retry.

**Completion Criteria:** All API calls use the client; errors map to the shared envelope

---

### [x] Feature: Routing, Guards, and Navigation

-   Branch: `feature/routing-guards`
-   User Stories: RBAC (authorization on actions), Non-functional (Compatibility)
-   Goal: App Router protections, role/permission guards, and nav that reflects access.

#### Commits

1. `init protected routes and public routes`
    - Public auth pages vs protected dashboard/app.
2. `implement role and permission guards`
    - Client-side checks; server/render-friendly fallback UI.
3. `add navigation with rbac-aware sections`
    - Hide/show items by permission; aria-accessible.

**Completion Criteria:** Unauthorized users are redirected/blocked; navigation reflects permissions

---

## Accounts & Authentication

### [x] Feature: Authentication (Login/Logout/Session)

-   Branch: `feature/authentication`
-   User Stories: Passwords and sign‑in (login); Security and privacy (session handling); Notifications (optional sign-in messages)
-   Goal: Implement login, logout, session persistence, lockout UX.

#### Commits

1. `init auth routes and layout`
    - Login page, auth layout, redirects for signed-in users.
2. `implement login form ui and validation`
    - Email/password, validation, error states.
3. `integrate login api and session store`
    - Persist tokens securely; refresh handling.
4. `handle lockout and deactivated account messages`
    - UX per policy; support requestId surfaced from server.

**Completion Criteria:** Users can sign in/out; session persists; error states handled

---

### [x] Feature: External Sign‑Up & Email Verification

-   Branch: `feature/external-signup-and-verification`
-   User Stories: Account creation and approval (external); Account email verification
-   Goal: Allow external users to submit sign-up, await approval, verify email with one-time token and rate-limited resend.

#### Commits

1. `add external signup form ui and validation`
    - Collect required fields; show duplicate email errors.
2. `wire signup submission api and success state`
    - Persist pending state; show approval pending screen.
3. `implement email verification page`
    - Token link consumption; success/failure UX.
4. `add resend verification with rate limit ui`
    - Disable/respect server limits; explain cooldown.

**Completion Criteria:** External users can submit, verify email, and see pending-approval UX

---

### [x] Feature: Account Approval Console (Admins)

-   Branch: `feature/account-approval`
-   User Stories: Account creation and approval (approvers, approve/reject with reason); Notifications
-   Goal: UI for approvers to review pending accounts, approve/reject, emit notifications.

#### Commits

1. `create approval queue list with filters`
    - Pagination, search, status.
2. `build review drawer with applicant details`
    - Decision forms; rejection reason field.
3. `wire approve/reject apis with optimistic updates`
    - Emit toast, refresh list.

**Completion Criteria:** Admins can approve/reject with reasons; list updates

---

### [x] Feature: Profile Management

-   Branch: `feature/profile-management`
-   User Stories: Account management (view/update profile); Files & uploads (avatar constraints)
-   Goal: View and edit own profile fields; upload avatar with size/type checks.

#### Commits

1. `add profile page and read self details`
    - Display editable vs locked fields.
2. `implement profile edit form with validation`
    - Name, phone, avatar placeholder.
3. `add avatar upload with client-side checks`
    - Size/type validation; preview and remove.
4. `wire update profile api and success states`
    - Persist updates; surface fieldErrors.

**Completion Criteria:** Users update profile within policy; errors surfaced

---

### [x] Feature: Admin User Management

-   Branch: `feature/admin-user-management`
-   User Stories: Account management (admin edits, deactivate/reactivate; protect system accounts)
-   Goal: Admins can search, view, edit, deactivate/reactivate users.

#### Commits

1. `add users list with search and filters`
    - Status, role, date.
2. `user detail and edit screen`
    - Editable fields per policy.
3. `deactivate/reactivate actions with confirm`
    - Permission-guarded; system account protection.

**Completion Criteria:** Admins manage users fully with safeguards

---

### [x] Feature: Password Reset & Change Password

-   Branch: `feature/passwords`
-   User Stories: Passwords and sign‑in (forgot/reset/change); Security (lock sessions after change)
-   Goal: Forgot password, reset with time-limited token, change password when signed in.

#### Commits

1. `add forgot password ui`
    - Request reset email form.
2. `implement reset password page`
    - Token validation, new password policy.
3. `add change password form in profile`
    - Requires current password; policy checks.
4. `invalidate sessions and refresh state on change`
    - Log out other sessions; reflect locally.

**Completion Criteria:** All password flows work and are policy-compliant

---

## RBAC

### [x] Feature: Role & Permission Management

-   Branch: `feature/rbac-management`
-   User Stories: RBAC (create/rename/delete roles; assign permissions; user role assignment; prevent zero-role)
-   Goal: Full UI for roles, permissions, and user-role assignments.

#### Commits

1. `roles list and create role dialog`
    - Name/description uniqueness checks.
2. `edit/delete role with safeguards`
    - System-required role protection; non-empty users safety.
3. `permission assignment ui`
    - Assign/remove permissions to roles.
4. `user role assignment dialog`
    - Prevent zero-role state.

**Completion Criteria:** RBAC features function with policy safeguards

---

## Procurement

### Feature: Contracts (Employee)

-   Branch: `feature/contracts`
-   User Stories: Procurement > Contracts (create/edit/open/close/award)
-   Goal: Employees create/edit contracts, manage lifecycle, documents.

#### Commits

1. `contracts list with filters and pagination`
    - Status, owner, date ranges; default sort newest.
2. `create/edit contract form ui`
    - Title, description, budget, deadline, required docs.
3. `document management in contracts`
    - Upload/replace/remove with client-side checks.
4. `open/close contract actions`
    - Guarded by status/deadline.
5. `award contract flow and notifications hook`
    - Mark winner; triggers downstream notices.
6. `tests: contract lifecycle`
    - Draft->open->close->reopen->award.

**Completion Criteria:** Full contract lifecycle managed; validations enforced; tests pass.

---

### Feature: Vendor Applications

-   Branch: `feature/vendor-applications`
-   User Stories: Procurement > Vendor applications (submit before deadline, required docs, statuses); Public visibility for open contracts
-   Goal: Vendors view open contracts and submit applications with required documents; employees review and decide.

#### Commits

1. `public/open contracts list and details`
    - Public view for open contracts; required documents.
2. `vendor application form with validations`
    - Proposal details, docs, deadline checks.
3. `submit application api integration`
    - Handle ineligible/vendor status errors.
4. `application review ui for employees`
    - Status transitions: submitted, in review, awarded, rejected.
5. `tests: vendor application flows`
    - Before/after deadline; missing docs; decisions.

**Completion Criteria:** Vendors can apply correctly; employees can review and decide; tests pass.

---

### Feature: Internal Notes

-   Branch: `feature/internal-notes`
-   User Stories: Procurement > Internal notes (authorized-only visibility)
-   Goal: Add and view internal notes on contracts and applications with permission gating.

#### Commits

1. `notes panel component with acl checks`
    - Show only to authorized users.
2. `add note composer and list`
    - Rich text/plain; timestamp and author.
3. `wire notes api with optimistic ui`
    - Add, delete (if allowed); handle locks.
4. `tests: internal notes visibility`
    - Hidden from vendors; visible to permitted users.

**Completion Criteria:** Internal notes work with correct visibility; tests pass.

---

## HR Documents

### [x] Feature: HR/Company Documents Library

-   Branch: `feature/hr-documents`
-   User Stories: HR Documents (upload/view/download/replace/delete); Files & uploads
-   Goal: Upload, manage, and download HR documents with policy constraints.

#### Commits

1. `documents list with filters and pagination`
    - Type, owner, date, status.
2. `upload document flow with validation`
    - Size/type limits; multiple files per rules.
3. `replace and delete document actions`
    - Validate and swap versions; respect policy.
4. `download links with expiry handling ui`
    - Handle expired/renewal flows gracefully.
5. `tests: document management`
    - Upload/replace/delete/download permission.

**Completion Criteria:** Document library fully functional; validations enforced; tests pass.

---

## Notifications

### Feature: In‑App Notifications (Realtime + Offline)

-   Branch: `feature/notifications`
-   User Stories: Notifications (web sockets, queue offline, unread counts, ack with retry, permissions, broadcast)
-   Goal: Real-time notifications with ack/retry, unread counts, and permission-gated access.

#### Commits

1. `notification bell and dropdown ui`
    - Unread badge, list, timestamps.
2. `websocket client and message envelope`
    - Subscribe/authenticate; handle reconnect.
3. `offline queue and delivery on reconnect`
    - Store until acked or expired.
4. `ack with retry and backoff`
    - Retry up to limits; mark read.
5. `permissions and preferences integration`
    - List/read/ack gated; opt-outs honored.
6. `tests: realtime and offline delivery`
    - Acks, retries, badge accuracy.

**Completion Criteria:** Realtime notifications reliable with accurate unread counts; tests pass.

---

## Cross-Cutting UX and Policies

### Feature: File Upload Components & Policies

-   Branch: `feature/file-uploads`
-   User Stories: Files and uploads (types, size limits, virus-scan status display)
-   Goal: Reusable uploader with client-side validation and scan status UI.

#### Commits

1. `build reusable file uploader`
    - Drag/drop, progress, multiple files.
2. `validate file size and type on client`
    - Enforce limits and error states.
3. `expose hooks for scan/pending/blocked states`
    - Poll status and display results.
4. `tests: uploader validations`
    - Type/size; progress; blocked files UX.

**Completion Criteria:** Uploader enforces policy and surfaces scan results; tests pass.

---

### Feature: Pagination, Sorting, and Filtering Framework

-   Branch: `feature/listing-framework`
-   User Stories: Pagination, sorting, and filtering
-   Goal: Shared list components and hooks to standardize list behaviors across pages.

#### Commits

1. `create pagination and page size controls`
    - Defaults to 25; 1–100 allowed.
2. `add sortable headers and sort state`
    - Allowed fields only; direction toggling.
3. `add filter bar with common controls`
    - Status, owner, date ranges, text search.
4. `integrate total counts or estimates`
    - Display pages and totals accurately.
5. `tests: list behaviors`
    - Paging, sorting, filtering combinations.

**Completion Criteria:** Lists use shared components; behaviors consistent and tested.

---

### Feature: Security & Privacy UX

-   Branch: `feature/security-privacy-ux`
-   User Stories: Security and privacy (PII masking, sensitive action confirmations, audit visibility); Concurrency and duplicate protection (idempotency tokens from client)
-   Goal: Consistent UX for sensitive flows and safe retries.

#### Commits

1. `mask pii in client logs and error uis`
    - Redact emails/phones from logs; admin-only details.
2. `add sensitive action confirmation dialogs`
    - Approvals, role changes, deletions.
3. `propagate idempotency keys for creates`
    - Client token generation and storage for retries.
4. `tests: pii redaction and confirmations`
    - Ensure no leaks; dialogs required.

**Completion Criteria:** Sensitive actions protected; PII redacted; idempotent creates supported; tests pass.

---

### Feature: Internationalization, Time, and Money

-   Branch: `feature/i18n-time`
-   User Stories: Internationalization and time; Money fields
-   Goal: Consistent timezone display, formatting, and i18n-ready UI text.

#### Commits

1. `configure i18n library and message catalogs`
    - Keyed strings; default locale.
2. `implement timezone-aware datetime formatting`
    - Include timezone in displays.
3. `add currency formatting utilities`
    - Two decimal places; explicit currency.
4. `tests: formatting utilities and i18n`
    - Date/time/currency conversions.

**Completion Criteria:** UI strings keyed; times and money formatted consistently; tests pass.

---

### Feature: Rate Limits & Fair Use Handling

-   Branch: `feature/rate-limits`
-   User Stories: Rate limits and fair use; Password reset rate limiting
-   Goal: Standard UI patterns for 429s, backoff, and rate-limited actions.

#### Commits

1. `standard 429 handling in api client`
    - Backoff and helpful messaging.
2. `add reusable rate-limited action button`
    - Shows cooldown and disables.
3. `apply to reset and verification resend`
    - Respect server quotas; UX feedback.
4. `tests: rate limit flows`
    - Exhaust limits; cooldown; recovery.

**Completion Criteria:** Users guided during throttling; key flows respect limits; tests pass.

---

### Feature: Frontend Observability and Health UX

-   Branch: `feature/frontend-observability`
-   User Stories: Observability (metrics, error rates, response times); Availability (health banners)
-   Goal: Client metrics hooks and user-facing health banners for outages.

#### Commits

1. `add client metrics instrumentation`
    - Page view, API latency, error counters.
2. `implement global error boundary`
    - Capture and report unhandled errors.
3. `add health check banner`
    - Readiness/live indicators; planned maintenance.
4. `tests: error boundary and banners`
    - Simulate failures; verify UX.

**Completion Criteria:** Metrics emitted; outages surfaced to users; tests pass.

---

### Feature: Feature Flags Integration

-   Branch: `feature/feature-flags`
-   User Stories: Environment, configuration, and deployment (feature flags)
-   Goal: Toggle features safely without redeploys.

#### Commits

1. `integrate feature flag provider`
    - Read flags from config/provider.
2. `gate experimental pages with flags`
    - Sample usage in non-critical flows.
3. `tests: flag gating`
    - Verify on/off behavior.

**Completion Criteria:** Flags can enable/disable UI safely; tests pass.

---

## Delivery Notes

-   Branch Naming: Use lowercase kebab-case feature names, e.g., `feature/user-authentication`, `feature/hr-documents`. Keep names concise and descriptive.
-   Commit Messages: Use imperative mood (e.g., "add login form validation"). Optionally follow Conventional Commits (feat, fix, docs, refactor, test, chore).
-   Incremental Delivery: Each feature branch is merged independently once all commits are complete and tests pass.
-   Completion Definition: A feature is complete only when user-story compliant, fully functional, and test-verified across unit and e2e.
-   Dependencies: Foundation features (design system, testing, api client, routing/guards) should land first; domain features can proceed in parallel with clear boundaries.
-   Accessibility & Responsiveness: All UIs should meet basic accessibility expectations (labels, aria, keyboard navigability) and be responsive.

---

## Traceability Matrix (Feature -> User Stories)

-   Design System & Theming -> Non-functional (Design philosophy, Dark Mode)
-   Testing & Quality Tooling -> Testing and quality
-   API Client & Errors -> Standard errors; Observability; Rate limits; Compatibility
-   Routing, Guards, and Navigation -> RBAC (authorization); Compatibility
-   Authentication -> Passwords and sign‑in (login); Security and privacy
-   External Sign‑Up & Verification -> Account creation and approval (external); Account email verification
-   Account Approval Console -> Account creation and approval (approvers); Notifications
-   Profile Management -> Account management; Files & uploads (avatar)
-   Admin User Management -> Account management (admins)
-   Password Reset & Change -> Passwords and sign‑in; Security
-   RBAC Management -> RBAC (roles, permissions, assignments)
-   Contracts (Employee) -> Procurement > Contracts
-   Vendor Applications -> Procurement > Vendor applications; Public contract visibility
-   Internal Notes -> Procurement > Internal notes
-   HR Documents -> HR Documents; Files & uploads
-   In‑App Notifications -> Notifications (realtime, ack, retry, permissions)
-   File Upload Components -> Files & uploads; Security
-   Pagination/Sorting/Filtering -> Pagination, sorting, and filtering
-   Security & Privacy UX -> Security and privacy; Concurrency and duplicate protection
-   Internationalization & Time -> Internationalization and time; Money fields
-   Rate Limits Handling -> Rate limits and fair use; Email verification/Reset limits
-   Frontend Observability -> Observability; Availability
-   Feature Flags -> Environment, configuration, and deployment (feature flags)

---

## Merge and Release Guidance

-   Each feature should include a brief README snippet or docs update clarifying user-facing changes and any flags or config.
-   Avoid breaking changes; where unavoidable, feature-flag the behavior and coordinate merges.
-   Post-merge, run a small smoke test in staging, verify logs/metrics, and confirm no regressions before production promotion.
