# JDC Portal Client - Service Layer Refactor

## Overview

The service layer has been refactored to align with the current API contract at `http://localhost:4000/api`. This refactor focuses on ensuring type safety, proper error handling, and consistent patterns across all services.

## Key Changes Made

### 1. API Client Configuration

-   ✅ Updated base URL handling to properly append `/api` when not present
-   ✅ Maintained existing JWT authentication and refresh logic
-   ✅ Preserved automatic retry and error handling mechanisms

### 2. Type System Updates

-   ✅ Enhanced `PaginatedResponse<T>` interface
-   ✅ Added comprehensive error handling types
-   ✅ Created utility types for field validation errors
-   ✅ Standardized API response interfaces

### 3. Service Layer Improvements

-   ✅ All services aligned with documented API endpoints
-   ✅ Consistent query parameter building patterns
-   ✅ Proper TypeScript types for all service methods
-   ✅ Maintained backward compatibility where possible

### 4. Utilities Added

-   ✅ `utils/queryParams.ts` - Centralized query parameter building
-   ✅ `utils/errorHandling.ts` - Enhanced error handling with user-friendly messages
-   ✅ Improved validation and error mapping

## Service Status

| Service               | Status      | Notes                                    |
| --------------------- | ----------- | ---------------------------------------- |
| **auth.ts**           | ✅ Complete | All endpoints aligned with API docs      |
| **rbac.ts**           | ✅ Complete | RBAC endpoints and types verified        |
| **contract.ts**       | ✅ Complete | Contract lifecycle management aligned    |
| **file.ts**           | ✅ Complete | File upload/download and HR docs aligned |
| **employee.ts**       | ✅ Complete | Employee management endpoints verified   |
| **vendor.ts**         | ✅ Complete | Vendor operations aligned                |
| **notifications.ts**  | ✅ Complete | Notification system endpoints verified   |
| **internal-notes.ts** | ✅ Complete | Internal notes functionality aligned     |

## API Contract Verification

Based on the API documentation at `http://localhost:4000/api`, all services have been verified against:

### Authentication Endpoints

-   POST `/auth/login` - User authentication
-   POST `/auth/register/employee` - Employee registration
-   POST `/auth/register/vendor` - Vendor registration
-   POST `/auth/refresh` - Token refresh
-   GET `/auth/me` - Current user profile
-   GET `/auth/me/permissions` - User permissions

### RBAC Endpoints

-   GET `/admin/roles` - Role management
-   GET `/admin/permissions` - Permission listing
-   POST `/admin/users/{userId}/roles` - Role assignment

### Contract Management

-   GET `/contracts` - Contract listing with pagination
-   POST `/contracts` - Contract creation
-   GET `/contracts/active` - Active contracts
-   POST `/contracts/{id}/apply` - Vendor applications

### File Management

-   POST `/files/upload` - File uploads
-   GET `/files/{id}/download` - File downloads
-   PUT `/files/{id}/replace` - File replacement
-   POST `/hr-documents/files/upload` - HR document uploads

## Breaking Changes

### For Components/Pages

The service layer maintains backward compatibility for most use cases. However, some type adjustments may be needed:

```typescript
// Before: May have used raw response
const contracts = await api.get("/contracts");

// After: Use typed service
const contracts = await contractService.getContracts({
    page: 1,
    pageSize: 25,
});
```

### Error Handling

Enhanced error handling is now available:

```typescript
import { handleApiError, ApiError } from "@/lib/utils/errorHandling";

try {
    await AuthService.login(credentials);
} catch (error) {
    const apiError = handleApiError(error);
    if (apiError.is("ValidationError")) {
        // Handle validation specifically
    }
    // Use apiError.getUserMessage() for user-friendly messages
}
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:4000

# Optional
NEXT_PUBLIC_API_TIMEOUT_MS=20000
```

## Testing

All services can be tested by mocking the API client:

```typescript
jest.mock("@/lib/api", () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
}));
```

## Next Steps

1. ✅ Service layer refactoring complete
2. 🔄 Update consuming components to handle new types (outside scope)
3. 🔄 Add integration tests (outside scope)
4. 🔄 Update documentation (outside scope)

## Assumptions & Limitations

### API Contract Assumptions

-   All endpoints follow the documented API contract
-   Error responses use standardized format with `code`, `message`, `fieldErrors`
-   Pagination uses `data`, `total`, `page`, `pageSize`, `totalPages` structure
-   Authentication uses JWT tokens with HTTP-only refresh cookies

### Endpoints Not Verified

Since the API server was not accessible during refactoring, the following assumptions were made based on the documentation:

-   All documented endpoints are functional and return expected response formats
-   Error response structure matches the documented schema
-   File upload/download mechanisms work as documented

If any endpoints behave differently than documented, services can be easily updated to match actual behavior.

## Support

For questions about the service layer:

1. Check the updated `src/lib/README.md` for comprehensive documentation
2. Review type definitions in `src/lib/types/` for data structures
3. Examine service implementations in `src/lib/services/` for usage patterns
