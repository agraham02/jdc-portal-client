export enum UserStatus {
    PENDING = "Pending", // Awaiting approval or onboarding
    ACTIVE = "Active", // Fully approved and active
    INACTIVE = "Inactive", // Temporarily disabled (leave, suspended, etc.)
    ONBOARDING = "Onboarding", // In the process of being set up
    REJECTED = "Rejected", // Registration/application denied
    TERMINATED = "Terminated", // Explicitly ended (employment/lease ended)
    ARCHIVED = "Archived", // Soft-deleted or historical
}

export enum AccountType {
    ADMIN = "Admin",
    EMPLOYEE = "Employee",
    VENDOR = "Vendor",
    HOUSING_TENANT = "Housing Tenant",
}

export enum RoleName {
    ADMIN = "Admin",
    EMPLOYEE = "Employee",
    VENDOR = "Vendor",
}

// Map each accountType to its default RoleName
export const DefaultRoleForAccountType: Record<AccountType, RoleName> = {
    [AccountType.ADMIN]: RoleName.ADMIN,
    [AccountType.EMPLOYEE]: RoleName.EMPLOYEE,
    [AccountType.VENDOR]: RoleName.VENDOR,
    [AccountType.HOUSING_TENANT]: RoleName.VENDOR, // or assign a dedicated role if created later
};

export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
}

export interface Role {
    _id: string;
    name: RoleName;
    description?: string;
    permissions: string[] | Permission[]; // Can be ObjectIds or populated Permission objects
}

export interface Permission {
    _id: string;
    name: string; // e.g., "employee:create", "vendor:read:all", "contract:apply"
    description?: string;
}

export interface User {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    fullName: string; // Virtual field - not optional
    roles: string[] | Role[]; // Can be ObjectIds or populated Role objects
    accountType: AccountType;
    status: UserStatus;
    physicalAddress?: Address;
    mailingAddress?: Address;
    contactEmail?: string;
    contactPhone?: string;
    lastLogin?: Date;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Vendor {
    _id: string;
    userId: string | User; // Can be ObjectId or populated User
    website?: string;
    companyName: string;
    contactName?: string; // Primary contact person for the vendor company
    servicesOffered?: string[];
    notes?: string; // Internal admin comments
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Employee {
    _id: string;
    userId: string; // Link to the User document
    employeeId?: string; // Company-specific employee ID
    jobTitle?: string;
    department?: string;
    hireDate?: Date;
    managerId?: string; // Reference to another Employee._id
    createdAt?: Date;
    updatedAt?: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
