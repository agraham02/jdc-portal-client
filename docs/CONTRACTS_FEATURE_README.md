# Contracts & Applications Feature

## Overview

The Contracts & Applications feature enables staff to create and manage procurement contracts, and vendors to submit applications. The feature supports the full contract lifecycle from draft to award.

## Contract Lifecycle

```
Draft → Open → Closed → Awarded
         ↓
    (Applications)
```

### Status Transitions

-   **Draft**: Being created/edited by staff (not visible to vendors)
    -   Actions: Edit, Publish, Delete
-   **Open**: Published and accepting applications from vendors
    -   Actions: Close, Award (if applications exist), Delete
-   **Closed**: No longer accepting applications
    -   Actions: Reopen, Delete
-   **Awarded**: Winner selected, contract fulfilled
    -   Actions: None (cannot delete)

## Components

### Core Display Components

#### `ContractCard`

Compact card for displaying contracts in grid/list views.

**Props:**

```tsx
{
  contract: Contract;
  showApplicationCount?: boolean; // Staff view only
  className?: string;
}
```

**Usage:**

```tsx
<ContractCard contract={contract} showApplicationCount={isStaff} />
```

#### `ContractList`

Paginated list with search and filter controls.

**Props:**

```tsx
{
  contracts: Contract[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  onStatusChange?: (status: ContractStatus | "all") => void;
  showApplicationCount?: boolean;
  currentStatus?: ContractStatus | "all";
  currentSearch?: string;
  loading?: boolean;
}
```

**Usage:**

```tsx
<ContractList
    contracts={contracts}
    total={total}
    page={currentPage}
    pageSize={20}
    onPageChange={setPage}
    onSearchChange={setSearch}
    onStatusChange={setStatus}
    showApplicationCount={hasPermission(P.CONTRACT_READ_ALL)}
/>
```

#### `ContractDetail`

Full contract details with lifecycle actions.

**Props:**

```tsx
{
  contract: Contract;
  onPublish?: () => Promise<void>;
  onClose?: () => Promise<void>;
  onAward?: (applicationId: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDownloadDocument?: (fileId: string, filename: string) => Promise<void>;
  showActions?: boolean;
}
```

**Usage:**

```tsx
<ContractDetail
    contract={contract}
    onPublish={handlePublish}
    onClose={handleClose}
    onAward={handleAward}
    onDelete={handleDelete}
    onDownloadDocument={handleDownload}
    showActions={isStaff}
/>
```

### Primitive Components

#### `StatusChip`

Badge for contract/application status.

```tsx
<StatusChip status={ContractStatus.OPEN} />
<StatusChip status={ApplicationStatus.SUBMITTED} />
```

#### `FileList`

Document list with download/delete actions.

```tsx
<FileList
    files={contract.documents}
    onDownload={(file) => downloadFile(file._id, file.filename)}
    onDelete={(file) => deleteFile(file._id)}
    showDelete={isDraft}
/>
```

#### `ConfirmDialog`

Confirmation modal for destructive actions.

```tsx
<ConfirmDialog
    open={showConfirm}
    onOpenChange={setShowConfirm}
    title="Delete Contract"
    description="This action cannot be undone."
    onConfirm={handleDelete}
    variant="destructive"
/>
```

#### `Pagination`

Pagination controls with page size selector.

```tsx
<Pagination
    currentPage={page}
    totalPages={totalPages}
    totalItems={total}
    pageSize={pageSize}
    onPageChange={setPage}
    onPageSizeChange={setPageSize}
/>
```

## API Services

### ContractsService

```typescript
import { ContractsService } from "@/lib/services/contracts";

// List contracts
const { data, total, page, pageSize } = await ContractsService.listContracts({
    page: 1,
    limit: 20,
    status: ContractStatus.OPEN,
    search: "office supplies",
});

// Get contract (staff view)
const contract = await ContractsService.getContract(contractId);

// Get public contract (vendor view)
const publicContract = await ContractsService.getPublicContract(contractId);

// Create contract
const newContract = await ContractsService.createContract({
    title: "Office Supplies Q4",
    description: "Procurement for office supplies...",
    budget: 50000,
    currency: "USD",
    deadline: "2025-12-31T23:59:59.000Z",
    requiresResponsiveSupport: true,
    requiredDocuments: [
        {
            name: "Business License",
            description: "Valid license",
            required: true,
        },
    ],
});

// Update draft
await ContractsService.updateContract(contractId, {
    budget: 55000,
});

// Publish (Draft → Open)
await ContractsService.openContract(contractId);

// Close (Open → Closed)
await ContractsService.closeContract(contractId);

// Award (Open → Awarded)
await ContractsService.awardContract(contractId, {
    applicationId: winningApplicationId,
});

// Delete
await ContractsService.deleteContract(contractId);

// Upload documents (draft only)
const files = [file1, file2];
await ContractsService.uploadDocuments(contractId, files);

// Replace document (draft only)
await ContractsService.replaceDocument(contractId, fileId, newFile);

// Delete document (draft only)
await ContractsService.deleteDocument(contractId, fileId);
```

### ApplicationsService

```typescript
import { ApplicationsService } from "@/lib/services/contracts";

// Submit application (vendor)
const { application } = await ApplicationsService.submitApplication(
    contractId,
    { proposalDetails: "We propose..." },
    [document1, document2] // Required documents
);

// List applications for a contract (staff)
const { data: applications } = await ApplicationsService.listApplications(
    contractId,
    {
        status: ApplicationStatus.SUBMITTED,
    }
);

// Update application status (staff)
await ApplicationsService.updateApplicationStatus(contractId, applicationId, {
    status: ApplicationStatus.REVIEWED,
});

// Withdraw application (vendor)
await ApplicationsService.withdrawApplication(contractId, applicationId);

// Cancel application (admin)
await ApplicationsService.cancelApplication(
    contractId,
    applicationId,
    "Vendor did not meet requirements"
);

// Get vendor's applications
const { data: myApps } = await ApplicationsService.getMyApplications();

// Get applications inbox (staff)
const { data: inbox } = await ApplicationsService.getApplicationsInbox();
```

### InternalNotesService

```typescript
import { InternalNotesService } from "@/lib/services/contracts";

// List notes for a contract
const { data: notes } = await InternalNotesService.listNotes(contractId, {
    applicationId: appId, // Optional filter
});

// Create note
const { note } = await InternalNotesService.createNote(contractId, {
    content: "Vendor has strong references",
    applicationId: appId, // Optional
});

// Update note
await InternalNotesService.updateNote(contractId, noteId, {
    content: "Updated note content",
});

// Delete note
await InternalNotesService.deleteNote(contractId, noteId);
```

## Permissions

```typescript
import { PermissionName as P } from "@/lib/constants/permission-names";

// Contract management
P.CONTRACT_CREATE; // Create contracts
P.CONTRACT_READ; // Read own contracts
P.CONTRACT_READ_ALL; // Read all contracts
P.CONTRACT_UPDATE; // Update contracts
P.CONTRACT_DELETE; // Delete contracts
P.CONTRACT_PUBLISH; // Publish contracts (Draft → Open)
P.CONTRACT_AWARD; // Award contracts
P.CONTRACT_APPLY; // Apply to contracts (vendor)

// Application management
P.CONTRACT_REVIEW_APPLICATIONS; // Review applications
P.CONTRACT_MANAGE_APPLICATIONS; // Manage (cancel) applications
P.APPLICATION_WITHDRAW; // Withdraw own applications

// Internal notes
P.INTERNAL_NOTE_CREATE; // Create notes
P.INTERNAL_NOTE_READ; // Read notes
P.INTERNAL_NOTE_UPDATE; // Update own notes
P.INTERNAL_NOTE_DELETE; // Delete own notes
```

## Types

See `src/lib/types/contracts.ts` for complete type definitions.

**Key types:**

-   `Contract` - Contract model with full lifecycle fields
-   `Application` - Vendor application
-   `RequiredDocument` - Document requirement specification
-   `FileDocument` - Uploaded file metadata
-   `InternalNote` - Staff-only note
-   `ContractStatus` - Draft | Open | Closed | Awarded
-   `ApplicationStatus` - Submitted | Reviewed | Accepted | Rejected | Withdrawn | Cancelled

## File Validation

```typescript
import { CONTRACT_FILE_VALIDATION } from "@/lib/types/contracts";

// Limits
CONTRACT_FILE_VALIDATION.maxSizeMB; // 100
CONTRACT_FILE_VALIDATION.maxFiles; // 20

// Allowed types
CONTRACT_FILE_VALIDATION.allowedTypes; // PDF, DOCX, XLSX, TXT, images, ZIP
```

## Routes

-   `/contracts` - List all contracts
-   `/contracts/[id]` - Contract details
-   `/contracts/new` - Create new contract
-   `/contracts/[id]/edit` - Edit draft contract
-   `/contracts/my-applications` - Vendor's applications
-   `/contracts/applications-inbox` - Staff applications inbox

## Error Handling

The API follows a standard error format:

```typescript
interface ApiError {
    code: string; // Machine-readable code
    message: string; // Human-readable message
    requestId?: string; // For support tracking
    details?: object; // Additional context
    fieldErrors?: Array<{
        // Validation errors
        field: string;
        message: string;
        code?: string;
    }>;
}
```

**Common error codes:**

-   `VALIDATION_ERROR` - Invalid input data
-   `DUPLICATE_APPLICATION` - Vendor already applied
-   `DEADLINE_PASSED` - Application deadline expired
-   `INVALID_STATE_TRANSITION` - Invalid status change
-   `MISSING_REQUIRED_DOCUMENTS` - Required docs not uploaded
-   `UNAUTHORIZED` - Missing/invalid token
-   `FORBIDDEN` - Insufficient permissions
-   `NOT_FOUND` - Resource doesn't exist

## Best Practices

### 1. Permission-Based Rendering

```tsx
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

<Can anyOf={[P.CONTRACT_CREATE]}>
    <Button>Create Contract</Button>
</Can>;
```

### 2. Error Handling

```typescript
try {
    await ContractsService.publishContract(id);
    toast.success("Contract published successfully");
} catch (error) {
    const apiError = error as StandardError;
    toast.error(apiError.message);
    console.error("Publish failed:", apiError.code, apiError.requestId);
}
```

### 3. Optimistic Updates

```typescript
// Show immediate feedback
setContract({ ...contract, status: ContractStatus.OPEN });

try {
    await ContractsService.openContract(contract._id);
} catch (error) {
    // Revert on error
    setContract(originalContract);
    toast.error("Failed to publish contract");
}
```

### 4. File Uploads

```typescript
// Validate before upload
const validFiles = files.filter((file) => {
    const isValidSize =
        file.size <= CONTRACT_FILE_VALIDATION.maxSizeMB * 1024 * 1024;
    const isValidType = CONTRACT_FILE_VALIDATION.allowedTypes.includes(
        file.type
    );
    return isValidSize && isValidType;
});

if (validFiles.length !== files.length) {
    toast.error("Some files were rejected due to size or type restrictions");
}

// Upload with progress
await ContractsService.uploadDocuments(contractId, validFiles);
```

## Testing

### Manual Testing Checklist

**Contract Lifecycle:**

-   [ ] Create draft contract
-   [ ] Upload documents to draft
-   [ ] Publish draft (Draft → Open)
-   [ ] Verify vendors can see open contract
-   [ ] Submit application as vendor
-   [ ] Review application as staff
-   [ ] Award contract
-   [ ] Verify winner notification

**Permissions:**

-   [ ] Vendors cannot create contracts
-   [ ] Vendors cannot see draft contracts
-   [ ] Staff can see all contracts
-   [ ] Awarded contracts cannot be deleted
-   [ ] Only draft contracts can be edited

**Edge Cases:**

-   [ ] Expired deadline prevents applications
-   [ ] Duplicate applications rejected
-   [ ] File size/type validation works
-   [ ] Virus-infected files rejected (422)
-   [ ] Large uploads don't timeout

---

## Troubleshooting

**Q: Contract not showing for vendors?**  
A: Ensure contract status is `Open` and deadline hasn't passed.

**Q: Cannot edit contract?**  
A: Only `Draft` status contracts can be edited.

**Q: File upload failing?**  
A: Check file size (<100MB), type (PDF/DOCX/etc), and count (<20 files).

**Q: Permission denied error?**  
A: Verify user has the required permission (check with `<Can>` component).

---

## Future Enhancements

-   [ ] Contract templates
-   [ ] Email notifications for contract events
-   [ ] Bulk contract actions
-   [ ] Advanced search and filtering
-   [ ] Contract analytics dashboard
-   [ ] Vendor ratings and history
-   [ ] Contract amendments and addendums
