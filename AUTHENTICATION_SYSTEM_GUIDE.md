# JDC Portal Authentication System - Complete Guide

## Overview

This authentication system provides a comprehensive, production-ready solution for role-based access control (RBAC) with automatic token refresh, user status management, and secure session handling. The system is designed to work with a NestJS backend that uses JWT access tokens and httpOnly refresh tokens.

## Core Architecture

### Authentication Flow
1. **Login** → User provides credentials → Backend returns access token + sets httpOnly refresh token
2. **API Calls** → Access token sent as Bearer token → Automatic refresh if expired
3. **Page Refresh** → Check for access token → Auto-refresh using httpOnly cookie if needed
4. **Logout** → Clear client tokens + invalidate server refresh token

### Key Features
- ✅ Automatic token refresh on expiration
- ✅ Role-based access control (Admin, Employee, Vendor)
- ✅ Account type-based routing
- ✅ User status management (Active, Pending, Onboarding, etc.)
- ✅ Permission-based access control
- ✅ Secure httpOnly cookie handling
- ✅ Route protection with guards
- ✅ Seamless user experience during token refresh

---

## File Structure & Dependencies

```
src/
├── lib/
│   ├── types/auth.ts              # Core type definitions
│   ├── session.ts                 # Client-side token management
│   ├── api.ts                     # HTTP client with auto-refresh
│   ├── services/
│   │   ├── auth.ts               # Authentication service methods
│   │   └── index.ts              # Service exports
│   ├── contexts/
│   │   └── auth-context.tsx      # Global auth state management
│   ├── hooks/
│   │   └── useUserProfile.ts     # User profile utilities
│   └── validations/
│       └── auth.ts               # Form validation schemas
├── components/
│   ├── Navigation.tsx            # Main navigation component
│   └── auth/
│       ├── ProtectedRoute.tsx    # Route protection wrapper
│       ├── PublicRoute.tsx       # Public route handler
│       ├── RoleGuard.tsx         # Role-based component guard
│       ├── AccountTypeGuard.tsx  # Account type guard
│       ├── PermissionGuard.tsx   # Permission-based guard
│       ├── AccountStatus.tsx     # Account status display
│       ├── AccessDenied.tsx      # Access denied page
│       └── AuthDebugPanel.tsx    # Development debugging tool
└── app/
    ├── (auth)/                   # Authentication routes
    │   └── login/page.tsx
    ├── (app)/                    # Protected app routes
    │   ├── layout.tsx           # Main app layout with navigation
    │   ├── dashboard/page.tsx
    │   ├── admin/dashboard/page.tsx
    │   ├── employee/dashboard/page.tsx
    │   └── vendor/dashboard/page.tsx
    └── page.tsx                  # Landing page with auth redirects
```

---

## Detailed File Breakdown

### 🔧 Core Infrastructure

#### `src/lib/types/auth.ts`
**Purpose**: Central type definitions matching backend Mongoose schemas
**Key Exports**:
- `UserStatus` enum: PENDING, ACTIVE, INACTIVE, ONBOARDING, REJECTED, TERMINATED, ARCHIVED
- `AccountType` enum: ADMIN, EMPLOYEE, VENDOR, HOUSING_TENANT
- `RoleName` enum: ADMIN, EMPLOYEE, VENDOR
- `User` interface: Complete user object structure
- `Vendor`, `Employee` interfaces: Extended user data
- `Role`, `Permission` interfaces: Authorization structures

**Critical Notes**:
- `User.roles` can be ObjectIds (strings) or populated Role objects
- `User.fullName` is a virtual field (non-optional)
- Removed `isActive`/`isArchived` fields - now handled by `status` only

#### `src/lib/session.ts`
**Purpose**: Client-side token storage and management
**Key Methods**:
- `setAccessToken()`: Stores access token in secure cookie (15 min expiry)
- `getAccessToken()`: Retrieves current access token
- `destroy()`: Clears access token
- `debugCookies()`: Development utility to inspect cookies

**Security Features**:
- Secure cookies in production
- SameSite: "strict" for CSRF protection
- Short-lived access tokens (15 minutes)

#### `src/lib/api.ts`
**Purpose**: HTTP client with automatic token refresh
**Key Features**:
- **Automatic 401 handling**: Detects expired tokens and refreshes automatically
- **Request queuing**: Multiple concurrent requests wait for refresh completion
- **Credentials inclusion**: `credentials: "include"` for httpOnly cookies
- **Infinite loop prevention**: Excludes `/auth/refresh` from auto-retry
- **Error handling**: Redirects to login on refresh failure

**Critical Logic**:
```typescript
// On 401 response (expired token):
1. Check if already refreshing (prevent multiple calls)
2. Call /auth/refresh with httpOnly cookie
3. Update access token in session
4. Retry original request with new token
5. If refresh fails → logout + redirect to login
```

#### `src/lib/services/auth.ts`
**Purpose**: Authentication API methods
**Methods**:
- `login()`: Authenticate user, store tokens, fetch profile
- `logout()`: Clear client/server tokens
- `getProfile()`: Fetch current user data
- `refreshToken()`: Manually refresh access token

**Integration**: Uses `apiClient` for all requests, benefits from auto-refresh

### 🎯 State Management

#### `src/lib/contexts/auth-context.tsx`
**Purpose**: Global authentication state and utilities
**Key State**:
- `user`: Current authenticated user (AuthUser | null)
- `isLoading`: Authentication check in progress
- `isAuthenticated`: Boolean auth status

**Key Methods**:
- `hasRole()`: Check user roles (supports arrays)
- `hasAccountType()`: Check account type
- `hasPermission()`: Check specific permissions
- `isAccountActive()`: Verify account status is ACTIVE
- `refreshToken()`: Manual token refresh
- `getRoleNames()`, `getDisplayName()`: User data utilities

**Initialization Logic**:
1. Check for existing access token
2. If no token → attempt refresh with httpOnly cookie
3. If refresh succeeds → fetch user profile
4. If refresh fails → set user to null (unauthenticated)

#### `src/lib/hooks/useUserProfile.ts`
**Purpose**: Higher-level user profile utilities
**Utilities**:
- `canAdminister()`: Admin capabilities check
- `isManager()`: Management role check
- `needsOnboarding()`: Onboarding status
- `hasAccountIssues()`: Account problems detection
- `getContactInfo()`: Formatted contact data
- `getRoleDisplay()`: Human-readable role string

### 🛡️ Route Protection

#### `src/components/auth/ProtectedRoute.tsx`
**Purpose**: Wrapper component for protected pages
**Features**:
- Authentication check → redirect to login if not authenticated
- Account status check → show status page if account inactive
- Role requirements → show access denied if insufficient roles
- Permission requirements → granular permission checks

**Usage**:
```tsx
<ProtectedRoute requiredRoles={RoleName.ADMIN}>
  <AdminContent />
</ProtectedRoute>
```

#### `src/components/auth/PublicRoute.tsx`
**Purpose**: Wrapper for public pages (login, landing)
**Features**:
- Redirects authenticated users to appropriate dashboard
- Account type-based routing
- Loading state handling

#### Component Guards

##### `src/components/auth/RoleGuard.tsx`
**Purpose**: Hide/show components based on user roles
```tsx
<RoleGuard requiredRoles={[RoleName.ADMIN, RoleName.EMPLOYEE]}>
  <AdminEmployeeContent />
</RoleGuard>
```

##### `src/components/auth/AccountTypeGuard.tsx`
**Purpose**: Hide/show components based on account type
```tsx
<AccountTypeGuard requiredAccountTypes={AccountType.VENDOR}>
  <VendorOnlyContent />
</AccountTypeGuard>
```

##### `src/components/auth/PermissionGuard.tsx`
**Purpose**: Hide/show components based on specific permissions
```tsx
<PermissionGuard requiredPermissions="user:create">
  <CreateUserButton />
</PermissionGuard>
```

### 🎨 UI Components

#### `src/components/auth/AccountStatus.tsx`
**Purpose**: Display account status issues to users
**Handles**:
- PENDING: Awaiting approval
- ONBOARDING: Setup in progress  
- INACTIVE: Temporarily disabled
- REJECTED: Application denied
- TERMINATED: Access ended
- ARCHIVED: Account archived

#### `src/components/auth/AccessDenied.tsx`
**Purpose**: Standard access denied page for insufficient permissions

#### `src/components/Navigation.tsx`
**Purpose**: Main application navigation with role-based menu items
**Features**:
- Role-based navigation item visibility
- User info display
- Logout functionality

---

## Data Flow Diagrams

### Login Flow
```
User → Login Form → AuthService.login() 
                 ↓
                 Backend API (/auth/login)
                 ↓
                 Access Token + HttpOnly Refresh Cookie
                 ↓
                 session.setAccessToken() + AuthService.getProfile()
                 ↓
                 AuthContext.setUser() → Dashboard Redirect
```

### Auto-Refresh Flow
```
API Request → 401 Response → apiClient detects expired token
                           ↓
                           Check if already refreshing
                           ↓
                           POST /auth/refresh (with httpOnly cookie)
                           ↓
                           New Access Token → session.setAccessToken()
                           ↓
                           Retry Original Request → Success
```

### Page Refresh Flow
```
Page Load → AuthContext initialization
          ↓
          session.getAccessToken() → No token found
          ↓
          AuthService.refreshToken() (httpOnly cookie sent)
          ↓
          New Access Token + User Profile → User stays logged in
```

---

## Backend Integration Requirements

### Expected API Endpoints
- `POST /auth/login` - Returns `{ accessToken, expiresIn }` + sets httpOnly refresh cookie
- `POST /auth/logout` - Invalidates refresh token
- `GET /auth/me` - Returns current user profile
- `POST /auth/refresh` - Returns `{ accessToken }` using httpOnly cookie

### Required Backend Configuration
- **CORS**: Must allow credentials from frontend domain
- **Cookies**: Set httpOnly refresh token with secure flags
- **Token Expiry**: Short-lived access tokens (15 minutes recommended)

---

## Common Usage Patterns

### 1. Creating a New Protected Page
```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName } from "@/lib/types/auth";

export default function MyPage() {
  return (
    <ProtectedRoute requiredRoles={RoleName.ADMIN}>
      <div>Admin only content</div>
    </ProtectedRoute>
  );
}
```

### 2. Conditional Rendering Based on Role
```tsx
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/lib/contexts/auth-context";

function MyComponent() {
  const { user, hasRole } = useAuth();
  
  return (
    <div>
      <h1>Welcome {user?.fullName}</h1>
      
      <RoleGuard requiredRoles={RoleName.ADMIN}>
        <AdminPanel />
      </RoleGuard>
      
      {hasRole([RoleName.ADMIN, RoleName.EMPLOYEE]) && (
        <EmployeeTools />
      )}
    </div>
  );
}
```

### 3. Using User Profile Utilities
```tsx
import { useUserProfile } from "@/lib/hooks/useUserProfile";

function UserProfile() {
  const { 
    displayName, 
    needsOnboarding, 
    canAdminister,
    getContactInfo 
  } = useUserProfile();
  
  if (needsOnboarding()) {
    return <OnboardingWizard />;
  }
  
  return (
    <div>
      <h2>{displayName}</h2>
      {canAdminister() && <AdminTools />}
    </div>
  );
}
```

### 4. Manual Token Refresh
```tsx
import { useAuth } from "@/lib/contexts/auth-context";

function MyComponent() {
  const { refreshToken } = useAuth();
  
  const handleRefresh = async () => {
    const success = await refreshToken();
    if (success) {
      console.log("Token refreshed successfully");
    } else {
      console.log("Refresh failed - user will be logged out");
    }
  };
}
```

---

## Development & Debugging

### Debug Tools
- **AuthDebugPanel**: Visual debugging component with token/user info
- **Console Logs**: Comprehensive logging in auth context and API client
- **session.debugCookies()**: Inspect available cookies

### Common Issues & Solutions

#### 1. Refresh Token Not Working
**Symptoms**: User logged out on page refresh
**Causes**: 
- Missing `credentials: "include"` in API client
- CORS not configured for credentials
- Backend not setting httpOnly cookie

**Debug Steps**:
1. Check browser cookies for refresh token
2. Verify CORS allows credentials
3. Check console logs for refresh attempts

#### 2. Role-Based Access Not Working
**Symptoms**: Users seeing content they shouldn't
**Causes**:
- User.roles not populated correctly from backend
- Role checking logic not accounting for ObjectIds vs populated objects

**Debug Steps**:
1. Check user object structure in console
2. Verify roles array format
3. Test hasRole() function

#### 3. Infinite Loading States
**Symptoms**: App stuck in loading
**Causes**:
- Auth initialization never completing
- API calls failing silently

**Debug Steps**:
1. Check auth context initialization logs
2. Verify API endpoints are reachable
3. Check for JavaScript errors

---

## Security Considerations

### Token Security
- ✅ Short-lived access tokens (15 minutes)
- ✅ HttpOnly refresh tokens (not accessible to JavaScript)
- ✅ Secure cookies in production
- ✅ SameSite: "strict" for CSRF protection

### Route Security
- ✅ Server-side route protection (backend responsibility)
- ✅ Client-side guards for UX (not security boundary)
- ✅ Role/permission checks on all sensitive operations

### Best Practices
- Always validate permissions on backend
- Use HTTPS in production
- Regularly rotate refresh tokens
- Monitor for suspicious authentication patterns

---

## Extending the System

### Adding New Roles
1. Update `RoleName` enum in `types/auth.ts`
2. Update `DefaultRoleForAccountType` mapping if needed
3. Add role to navigation items in `Navigation.tsx`
4. Create role-specific pages/components

### Adding New Permissions
1. Define permission strings in backend
2. Use `PermissionGuard` components for UI
3. Check permissions with `hasPermission()` method

### Adding New User Statuses
1. Update `UserStatus` enum in `types/auth.ts`
2. Add handling in `AccountStatus.tsx`
3. Update status checking logic as needed

---

## Testing Strategy

### Unit Tests
- Auth context state management
- Guard component logic
- User profile utilities

### Integration Tests
- Login/logout flows
- Token refresh scenarios
- Route protection

### E2E Tests
- Complete authentication workflows
- Role-based access scenarios
- Token expiration handling

---

This authentication system is designed to be robust, secure, and maintainable. The modular architecture allows for easy extension and modification while providing a seamless user experience with automatic token management.
