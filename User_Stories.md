# User Stories (Plain language, precise, and testable)

## Functional Requirements

### Accounts

#### Account creation and approval

-   Given a person is an internal employee, their account should be created by an authorized user, unless the person already has an active account.
-   Given a person is a vendor or other external party, they should be able to submit a sign‑up request, unless the email address is already in use.
-   Given a sign‑up request was created by an external party, the person should not be able to sign in until an authorized approver approves the account, unless the request was withdrawn or rejected.
-   Given an external account is approved, the person should be able to sign in and access only the features allowed by their roles, unless the account is deactivated.
-   Given a sign‑up request is rejected, the requester should be told the reason and prevented from signing in, unless they submit a new request that is later approved.
-   Given an employee account is required, the system should prevent self‑service employee sign‑ups, unless an authorized user creates the account on their behalf.

#### Account management

-   Given a signed‑in user views their profile, they should see their own details and be able to update editable fields (such as name, phone, and avatar), unless a field is locked by policy.
-   Given a signed‑in user saves profile changes, the new details should replace the old details, unless the new details are invalid or incomplete.
-   Given a signed‑in user requests account deletion, the account should be marked for review and approvers should be notified, unless the account is already deactivated or under a hold.
-   Given an authorized admin views a user’s account, they should be able to edit allowed details, unless the account is a protected system account.
-   Given an authorized admin deactivates a user, the user should be prevented from signing in and from using the system, unless the admin reactivates the account.

#### Passwords and sign‑in

-   Given a user forgets their password, they should be able to request a reset link, unless the account is deactivated.
-   Given a user follows a valid reset link within its time limit, they should be able to set a new password and sign in, unless the link was already used or expired.
-   Given a signed‑in user knows their current password, they should be able to change it, unless the current password is incorrect or the new password fails the rules.

### Role‑Based Access Control (RBAC)

#### Roles and permissions

-   Given a user has permission to manage roles, they should be able to create a new role and set its name and description, unless a role with the same name already exists.
-   Given a user has permission to manage roles, they should be able to rename or delete a role, unless the role is required by the system or deleting it would leave any user with no role.
-   Given a user has permission to manage role permissions, they should be able to assign or remove permissions to a role, unless the permission is not part of the system’s predefined list.
-   Given a user has permission to manage user roles, they should be able to assign or remove roles from a user, unless this change would leave the user with zero roles.
-   Given an action requires authorization, the system should allow it only if the user has a role that grants the needed permission, unless an admin override is explicitly granted by policy.

### Procurement

#### Contracts (creation and editing)

-   Given an employee has permission to create contracts, they should be able to create a contract with a title, description, budget, status, deadline, and required documents list, unless any required field is missing or invalid.
-   Given an employee edits a draft contract, they should be able to change its details and upload, replace, or remove documents, unless the contract has already been opened for applications.
-   Given a contract is opened for applications, vendors should be able to view its public details and required documents, unless the contract is closed or past its deadline.
-   Given a contract is closed, new applications should not be accepted, unless the contract is reopened by an authorized employee.
-   Given a contract is awarded, the winning vendor should be marked and non‑winners should be notified, unless the award decision is reversed by an authorized employee.

#### Vendor applications

-   Given a vendor has an approved account, they should be able to submit an application to an open contract before the deadline, unless they are ineligible for that contract.
-   Given a vendor submits an application, the application should include the proposal details, the application date, and any required supporting documents, unless the required documents are missing.
-   Given a vendor tries to apply after the deadline or after the contract is closed, the system should reject the application, unless the contract was reopened.
-   Given an employee reviews an application, they should be able to mark its status as submitted, in review, awarded, or rejected, unless the contract is deleted or archived.

#### Internal notes

-   Given an authorized employee views a contract or application, they should be able to add internal notes that only authorized users can see, unless the contract or application is locked.
-   Given an internal note is added, the note should be visible to users with the right permissions and hidden from vendors and other users, unless a policy explicitly shares it.

### HR Documents

-   Given an authorized user uploads an HR or company document, the document should be saved and listed for permitted users to see, unless the file type or size is not allowed.
-   Given a permitted user views an HR document, they should be able to download it, unless the document has been removed or their access was revoked.
-   Given an authorized user replaces an HR document, the new file should take the place of the old file for future views and downloads, unless the replacement fails validation.
-   Given an authorized user deletes an HR document, the document should be removed from view and download, unless a policy prevents deletion.

### HR Links and Resources

-   Given an authorized user creates an HR link to external resources (payroll portal, benefits system, training platform, policy repository), the link should be categorized and made available to permitted users, unless the URL format is invalid or the domain is not allowed.
-   Given a user views HR links, they should see organized links by category (payroll, benefits, training, policies, directory) with descriptions and active status, unless they lack permission to view HR resources.
-   Given an authorized user updates an HR link, the changes should be saved with an audit trail of who made the modification and when, unless the URL validation fails.
-   Given an authorized user deactivates an HR link, it should be hidden from regular users but preserved for audit purposes, unless the link is marked as permanent.
-   Given users search HR links, they should find relevant results based on title, description, or tags, unless the search terms are too broad or contain invalid characters.

### Notifications

-   Given an external account sign‑up is submitted, the appropriate approvers should be notified to review it, unless notifications are turned off.
-   Given an external account is approved or rejected, the requester should be notified of the decision, unless the contact address is invalid.
-   Given a new HR or company document is uploaded, the appropriate users should be notified, unless they have opted out of this type of notice.
-   Given a vendor submits a contract application, the appropriate reviewers should be notified, unless the contract is not accepting applications.
    -- Given a system event (for example, planned maintenance or a new feature), a broadcast notification should be sent to relevant users, unless those users have turned off system notifications or the event is not applicable to them.

## Non-functional requirements

### Availability and reliability

-   The service should be available at least 99.9% of the time each month, unless there is planned maintenance announced at least 72 hours in advance.
-   When a request finishes, it should either complete fully or not change anything, unless the story above explicitly allows a partial change and records it clearly for users to see.
-   If the system crashes, no one should lose more than their last confirmed save, unless they were in the middle of uploading a file that did not finish.

### Performance and responsiveness

-   For 95% of simple reads (like viewing details or lists), the response should arrive within 500 ms, unless the user is downloading files.
-   For 95% of changes (like creating or updating items), the response should arrive within 1 second for payloads up to 100 KB, unless an attached file is included.
-   For 95% of file uploads up to 100 MB, the upload should complete within 3 seconds per 25 MB of file size, unless the user’s network is slow.
-   Real‑time notifications should reach online users within 3 seconds of the event, unless the user is disconnected.

### Standard errors (consistent and helpful)

-   Every error response should use one clear format with these fields: a stable "code" (a short name), a human‑readable "message", a "requestId" for support, optional "details" with machine‑readable context, and optional "fieldErrors" listing the field, a message, and a code.
-   Validation problems should be reported as a bad request; missing items should be reported as not found; permission problems should be reported as forbidden; conflicting changes should be reported as a conflict; unexpected problems should be reported as a server error.
-   Error messages should be clear and specific, and should not reveal secrets or internal names, unless a message is only shown to admins.

### Notifications (real‑time and reliable)

-   Notifications should use web sockets when a user is online. If the user is offline, the notification should be queued and delivered when they return, unless the notification has already expired.
-   Each notification should include what happened, who it is for, when it happened, and whether it has been read. Unread counts should be accurate.
-   If a notification is not acknowledged by the client within 10 seconds, it should be retried up to 3 times with a short delay, unless the user disconnects.
-   Access to notifications should be permission-gated: users need permission to list/read/ack their notifications, and separate permissions to create or broadcast system messages.
-   Domain events across Accounts (sign-up submission/approval/rejection), HR Documents (upload/replace/delete), and Procurement (application submission/decision, contract award) should emit notifications to the correct audiences, honoring preferences and opt-outs.

### Pagination, sorting, and filtering

-   Lists should support page and pageSize. The default pageSize should be 25 and can be set between 1 and 100, unless a story sets a different limit for a specific list.
-   Lists should return the total number of items (or a best estimate when exact counting is too slow) so the client can show the number of pages.
-   Lists should have a stable default sort (newest first). Clients may request sorting by specific allowed fields and direction, unless that sort would leak private data.
-   Filtering should support common fields like status, owner, date ranges, and simple text search where it makes sense. Filters should be combined safely, unless a filter would make the list too slow.

### Files and uploads

-   Files should be virus‑scanned and rejected if a threat is found. Executable files should be blocked.
-   The allowed file types should include common documents and images (such as PDF, DOCX, XLSX, PNG, JPG), unless a policy forbids a type.
-   A single uploaded file should be at most 100 MB. A single request should include at most 20 files, unless a story sets a different limit.
-   The system should remember the original file name, type, and size, and should provide secure download links that expire within 10 minutes.
-   When a file is replaced, the new file should be used for future downloads while the old file is kept only if a retention rule requires it.

### Security and privacy

-   All connections should be protected so that data cannot be read in transit. Sensitive data at rest should be encrypted.
-   Passwords should follow reasonable rules: at least 12 characters, not found on common breach lists, and not similar to the user’s email or name.
-   After 5 failed sign‑in attempts, an account should be temporarily locked for 15 minutes, unless an admin unlocks it sooner.
-   Reset links should only work once and should expire after 30 minutes. After a password is changed, all existing sessions should be signed out.
-   Only the minimum necessary information should be shown in any view or log. Personal information should be masked in logs and never sent in error messages.
-   Every sensitive action (like approving accounts, changing roles, or changing permissions) should be recorded with who did it, what changed, and when it happened. These records should be kept for at least 1 year, unless a policy requires a different period.

### Concurrency and duplicate protection

-   When two people try to edit the same item at the same time, the second save should be stopped and told that something changed, unless the change can be safely merged without losing data.
-   When the client retries a create because of a network problem, the system should not create duplicates if the client sends the same unique token for up to 24 hours.

### Observability (logging, metrics, health)

-   Each request should be traced with a unique requestId so issues can be tracked. Logs should include the action, the person (when known), the result, and how long it took, without exposing secrets.
-   The system should measure request rates, error rates, response times, and notification delivery so trends and problems can be seen.
-   Alarms should alert the team when errors are unusually high or responses are unusually slow for at least 5 minutes, unless it is a planned test.
-   Health checks should report whether the system is ready to accept traffic and whether it is alive, without revealing internals.

### Backups and recovery

-   Data should be backed up every night with additional smaller backups throughout the day. A restore should be tested at least once a month.
-   In the worst case, no one should lose more than 15 minutes of recent changes (data loss window), and service should be restored within 2 hours (recovery time), unless a disaster makes this impossible.

### Internationalization and time

-   All times should be stored in a single time standard so they are consistent for everyone. When shown to users, times should include the date, time, and the time zone.
-   Text fields should accept international characters. Names with accents and non‑Latin characters should be stored and shown correctly.
-   Money fields should clearly state the currency and keep two decimal places when needed.

### Compatibility and changes

-   Changes that add new fields should not break existing clients. Removing or renaming fields should be announced well in advance and kept working for at least 6 months, unless a security issue forces a faster change.
-   The system should avoid breaking changes during normal updates. Upgrades should be planned so that old and new versions can work during the rollout.

### Rate limits and fair use

-   A single signed‑in user should be limited to a reasonable number of requests per minute so the system stays healthy. If the limit is exceeded, the user should be told to slow down.
-   Requests that are expensive (like exporting large lists or searching many records) should have tighter limits and clear messages when limits are reached.
-   Password reset requests should be limited to a small number per day to prevent abuse.

### Environment, configuration, and deployment

-   Settings such as keys and secrets should be stored securely and never hard‑coded.
-   The test and staging environments should mirror production behavior so changes can be safely tried before release.
-   Feature flags may be used to turn features on and off without a full release.
-   Data changes that require migrations should be versioned and should not require downtime during normal releases.

### Modularity and pluggability

-   Core subsystems for file storage and notifications should be modular so that implementations (e.g., local filesystem, S3; WebSocket, Email) can be swapped via configuration without code changes, unless a module requires a one-time migration clearly documented.
-   Notification delivery should support pluggable channels with a stable message envelope and retry/ack policy, unless the channel explicitly documents different guarantees.

### Account email verification

-   Newly created external accounts should require email verification using a one-time token that expires within 24 hours before full access is granted, unless the account is explicitly approved and verified by an admin.
-   Verification tokens should only work once and should be invalidated after use or expiry. Resend should be rate limited (for example, no more than 3 per hour), unless an admin overrides the limit.

### High-priority email notifications

-   When a notification is marked high priority, the system should send it via email in addition to in-app delivery if the recipient’s preferences allow email for that category, unless the email channel is disabled by policy.
-   Email notifications should be templated, logged with delivery status, and retried on transient failures up to a small limit with backoff, unless the provider reports a permanent bounce or unsubscribe.

### Testing and quality

-   Important flows (sign‑up, approval, sign‑in, role checks, contract creation, application submission, document upload, and notifications) should be covered by automated tests.
-   Most of the code should be covered by unit tests, and the most critical paths should be covered by end‑to‑end tests. Tests should run as part of every change before it is released.
