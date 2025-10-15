# 📋 TODO/FIXME Implementation Plan - Frontend

**Project:** JDC Portal Client  
**Created:** October 14, 2025  
**Status:** In Progress

> **Note:** This is the client-side companion to the main implementation plan. See `../jdc-portal-api/IMPLEMENTATION_PLAN.md` for the complete roadmap including backend tasks.

---

## 📊 Frontend Progress Overview

-   **Phase 1:** 0/3 ✗ (Critical UI Bugs)
-   **Phase 3:** 0/1 ✗ (UI Permission Controls)
-   **Phase 4:** 0/6 ✗ (UX Enhancements)
-   **Phase 5:** 0/1 ✗ (Routing)
-   **Phase 6:** 0/3 ✗ (Feature Completions)

**Frontend Progress:** 0/14 tasks complete (0%)

---

## 🗓️ Week 1: Critical Frontend Bugs

### Phase 1: Critical Bug Fixes ⚠️

-   [x] **1.1 Fix VendorRegistrationForm validation errors on step 3** ✅

    -   **File:** `src/components/vendors/VendorRegistrationForm.tsx:34`
    -   **Issue:** Errors pop up when first navigating to page 3
    -   **Solution:** Adjust validation trigger mode or conditional error display
    -   **Time:** 2 hours

-   [x] **1.2 Fix Services dropdown usability** ✅

    -   **File:** `src/components/vendors/VendorRegistrationForm.tsx:35`
    -   **Issue:** Dropdown disappears unexpectedly
    -   **Solution:** Debug ServicesInput focus/blur handlers
    -   **Time:** 3 hours

-   [x] **1.3 Fix Contract creation form (frontend side)** ✅
    -   **File:** `src/app/(app)/contracts/new/page.tsx:22`
    -   **Issue:** Form sends invalid data types to backend
    -   **Solution:** Ensure requiresResponsiveSupport is boolean
    -   **Time:** 1 hour

---

## 🗓️ Week 3-4: Permission Controls

### Phase 3: Access Control 🔒

-   [x] **3.2 Hide Create Contract button based on permission**
    -   **File:** `src/app/(app)/contracts/page.tsx:25`
    -   **Solution:** Wrap in `<Can anyOf={[P.CONTRACT_CREATE]}>` component
    -   **Time:** 30 minutes

---

## 🗓️ Week 4-5: UI/UX Improvements

### Phase 4: UI/UX Enhancements 🎨

-   [x] **4.1 Hide sidebar nav section titles when empty**

    -   **File:** `src/components/navigation/app-sidebar.tsx:14`
    -   **Solution:** Update NavSection to conditionally render title
    -   **Time:** 2 hours

-   [x] **4.2 Add 'same as physical address' checkbox**

    -   **File:** `src/components/vendors/VendorRegistrationForm.tsx:37`
    -   **Solution:** Add checkbox with setValue to copy address fields
    -   **Time:** 1 hour

-   [x] **4.3 Improve AddressForm UI/UX**

    -   **File:** `src/components/common/AddressForm.tsx:10`
    -   **Solution:** Better spacing, responsive grid, placeholders, ZIP validation
    -   **Time:** 4 hours

-   [x] **4.4 Refactor activate-account to multi-step flow** ✅

    -   **File:** `src/app/(auth)/activate-account/page.tsx:31`
    -   **Solution:** Multi-step form like VendorRegistrationForm
    -   **Time:** 6 hours

-   [x] **4.5 Improve profile page** ✅

    -   **File:** `src/app/(app)/profile/page.tsx:25`
    -   **Solution:** Broke into smaller components, added edit mode for employee data, better organization
    -   **Components Created:**
        -   `ProfileHeader.tsx` - Avatar upload section
        -   `GeneralInfoSection.tsx` - User personal info (editable)
        -   `PasswordSection.tsx` - Password change form
        -   `AccountInfoSection.tsx` - Read-only account details
        -   `EmployeeSection.tsx` - Employment info with RBAC-based editing
    -   **Time:** 6 hours

-   [ ] **4.6 Improve dashboard**
    -   **File:** `src/app/(app)/dashboard/page.tsx:6`
    -   **Solution:** Account-specific content, dynamic cards
    -   **Dependencies:** Backend dashboard service
    -   **Time:** 6 hours (frontend only)

---

## 🗓️ Week 5: Navigation

### Phase 5: Routing 🧭

-   [ ] **5.1 Redirect authenticated users from root**
    -   **File:** `src/app/layout.tsx:27`
    -   **Solution:** Middleware or page-level redirect to /dashboard
    -   **Time:** 3 hours

---

## 🗓️ Week 6: Feature Completions

### Phase 6: Features ✨

-   [ ] **6.1 Application detail page/modal**

    -   **File:** `src/app/(app)/contracts/[id]/page.tsx:333`
    -   **Solution:** Create ApplicationDetailModal component
    -   **Time:** 8 hours

-   [ ] **6.2 Roles dropdown in broadcasts**

    -   **File:** `src/app/(app)/notifications/broadcasts/page.tsx:17`
    -   **Solution:** Fetch roles from API, multi-select dropdown
    -   **Dependencies:** Backend /rbac/roles/names endpoint
    -   **Time:** 2 hours (frontend only)

---

## 🗓️ Week 7: Error Tracking

### Phase 8: Observability 📊

-   [ ] **8.1 Integrate Sentry**
    -   **Files:** `src/app/error.tsx`, `src/app/global-error.tsx`
    -   **Solution:** Install @sentry/nextjs, configure error boundaries
    -   **Time:** 4 hours

---

## 🧪 Testing Checklist

### Component Tests Needed

-   [ ] VendorRegistrationForm validation flow
-   [ ] ServicesInput focus/blur behavior
-   [ ] AddressForm responsive layout
-   [ ] NavSection permission filtering
-   [ ] ApplicationDetailModal rendering

### E2E Tests Needed

-   [ ] Contract creation flow
-   [ ] Profile update flow
-   [ ] Dashboard rendering by account type
-   [ ] Authentication redirects

### Accessibility Tests

-   [ ] Form keyboard navigation
-   [ ] Screen reader compatibility
-   [ ] Color contrast validation
-   [ ] Focus management

---

## 📝 Frontend-Specific Notes

### UI Library Stack

-   **Forms:** React Hook Form + Zod
-   **UI Components:** shadcn/ui
-   **Styling:** Tailwind CSS v4
-   **State Management:** SWR for server state
-   **Animations:** Framer Motion

### Code Standards

-   Use `function Component()` not arrow functions for components
-   Async/await over .then()
-   DRY principle - extract reusable logic
-   Semantic HTML + ARIA attributes
-   Dark mode support via Tailwind dark: variants

### Performance Considerations

-   Lazy load heavy components
-   Optimize images with Next.js Image
-   Minimize client-side JavaScript
-   Use Server Components where possible

---

**Last Updated:** October 14, 2025  
**Frontend Lead:** Development Team
