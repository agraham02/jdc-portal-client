# Statement of Work — In-App Help & Guides System

**Project:** JDC Portal – In-App Help & Guides Feature  
**Prepared by:** [Your Name / Company]  
**Prepared for:** [Client Name]  
**Date:** March 24, 2026  
**Version:** 1.0

---

## 1. Overview

This project adds a built-in Help & Guides system to the JDC Portal. The goal is to make the portal easier to learn and use by giving every user role access to:

- **Interactive Tours** — Step-by-step walkthroughs that highlight parts of the screen and guide users through tasks in real time
- **Written Guides** — Easy-to-read articles explaining how to use each area of the portal
- **A Help Center** — A central page where users can search for help, browse guides, and launch tours

This reduces the need for manual training and support by letting users learn the system at their own pace, directly inside the portal.

---

## 2. What's Included

### 2.1 Interactive Tours (9 total)

Tours are on-screen walkthroughs that highlight buttons, forms, and sections one step at a time, with descriptions explaining what each part does. Users click "Next" to advance through the tour.

**Key behaviors:**

- Tours automatically take the user to the right page before starting
- If a user's screen doesn't show a particular element (e.g., due to permissions), the tour skips that step gracefully
- Clicking the dark background advances to the next step (prevents accidental closing)
- The portal remembers which tours a user has completed

**Tour list:**

| Tour                  | Who It's For                        | What It Covers                                                                                 |
| --------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Portal Orientation    | Everyone                            | Full walkthrough of the portal layout — sidebar, header, navigation, notifications, and themes |
| Contracts Overview    | Admin, External Affairs             | How to find, browse, and create contracts                                                      |
| Employee Management   | Admin, Management, HR               | The employee directory, inviting employees, and managing statuses                              |
| Vendor Management     | Admin, External Affairs, Management | Browsing vendors and the approval workflow                                                     |
| HR Resources          | Admin, HR, Employee, Management     | HR document library — stats, documents, and links tabs                                         |
| Notifications         | Everyone                            | Notification center, preferences, and settings                                                 |
| Invite an Employee    | Admin, Management, HR               | Filling out the employee invitation form step by step                                          |
| Create a Contract     | Admin, External Affairs             | Creating a new contract — filling in details, uploading documents, and submitting              |
| Upload an HR Document | Admin, HR                           | Uploading a file, picking a category, and setting visibility                                   |

### 2.2 Written Guides (13 total)

Guides are formatted articles with numbered steps, tips, and warnings. They're organized by role so each user sees content relevant to them.

| Guide                            | For              | What It Covers                                                                 |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| Getting Started as Admin         | Admin            | Dashboard overview, admin tools, where to find settings                        |
| Managing Users & Roles           | Admin            | How to add users, assign roles, and manage permissions                         |
| Getting Started as Manager       | Management       | Manager dashboard, team oversight, quick actions                               |
| Managing Employees               | Management       | Full employee lifecycle — inviting, onboarding, editing, and changing statuses |
| Managing HR Resources            | HR               | Uploading documents, organizing categories, managing the resource library      |
| Employee Quick Start             | Employee         | Setting up your profile, finding HR resources, portal basics                   |
| Getting Started with Procurement | External Affairs | Overview of the procurement workflow — contracts and vendors                   |
| Creating & Managing Contracts    | External Affairs | How to create contracts, manage statuses, and handle document requirements     |
| Vendor Approval Workflow         | External Affairs | Reviewing vendors, approving or rejecting applications                         |
| Reviewing Contract Applications  | External Affairs | Evaluating vendor applications, accepting/rejecting, and awarding contracts    |
| Navigation & App Basics          | Everyone         | Sidebar navigation, dark/light mode, and general layout                        |
| Notifications                    | Everyone         | Setting notification preferences and managing alerts                           |
| Applying to Contracts            | Everyone         | How vendors can browse open contracts, submit applications, and track status   |

### 2.3 Help Center

A dedicated Help section within the portal with:

| Feature       | Description                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Help Hub      | A central page listing all guides, with search by keyword and filtering by role                                                              |
| Quick Actions | One-click buttons to launch the orientation tour or jump to commonly needed guides                                                           |
| Tours Page    | A page showing all 9 tours with play buttons, completion badges, and a "Reset All" option                                                    |
| Guide Viewer  | A clean reading page for each guide with a table of contents, estimated read time, role badges, previous/next navigation, and a print button |

### 2.4 Help Access Throughout the Portal

Help is easy to find no matter where you are:

| Feature               | Description                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Floating Help Button  | A small help button in the bottom-right corner of every page — click to start a tour or open the Help Center |
| "Start Tour" Buttons  | Quick-access tour buttons on the Employees, Contracts, Vendors, and HR Resources pages                       |
| Dashboard Quick Start | A card on the dashboard that launches the orientation tour for first-time users                              |

### 2.5 Print Support

Guides can be printed or saved as PDF with a clean, readable layout (navigation and buttons are automatically hidden when printing).

---

## 3. What's NOT Included

The following are outside the scope of this project:

- Backend or database changes
- Usage analytics or tracking (e.g., which guides are most viewed)
- Video tutorials or screen recordings
- Multi-language support
- An admin interface for editing guide content
- Automated testing for the help feature
- User ratings or feedback on guides
- AI-powered search or chatbot

Any of these can be added as a future enhancement if desired.

---

## 4. How We'll Know It's Done (Acceptance Criteria)

- [ ] All 9 tours launch correctly and walk through the right screens
- [ ] All 13 guides display properly with correct formatting and navigation
- [ ] Help Center search works — filters by title, description, and keywords
- [ ] Help Center role filter shows only guides relevant to the selected role
- [ ] Tours page tracks which tours have been completed and allows resetting
- [ ] The floating help button appears on every page
- [ ] "Start Tour" buttons on feature pages launch the right tour
- [ ] Guides print cleanly without navigation clutter
- [ ] Everything works in both light and dark mode
- [ ] Layout works well on desktop, tablet, and mobile
- [ ] No errors or bugs introduced to the existing portal

---

## 5. Pricing

| Item                                                    | Cost     |
| ------------------------------------------------------- | -------- |
| In-App Help & Guides System (all features listed above) | **$400** |

---

## 6. Payment Terms

Payment of **$400** is due upon final delivery and acceptance of all features listed in this agreement.

---

## 7. Timeline

| Milestone                               | Timeframe |
| --------------------------------------- | --------- |
| Phase 1 — Core system & help center     | Weeks 1–2 |
| Phase 2 — Tour experience polish        | Weeks 2–3 |
| Phase 3 — Content writing & integration | Weeks 3–4 |
| Your review & any revisions             | Weeks 4–5 |

---

## 8. Assumptions

1. You provide feedback within 3 business days during review periods
2. No major changes to the portal's existing layout or navigation during this project
3. All content is in English
4. The portal's existing user roles and permissions are stable
5. One round of revisions is included; additional rounds are billed at the hourly rate

---

## 9. Signatures

|               | Name | Signature | Date |
| ------------- | ---- | --------- | ---- |
| **Developer** |      |           |      |
| **Client**    |      |           |      |
