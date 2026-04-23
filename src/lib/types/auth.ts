export enum UserStatus {
    PENDING = "Pending",
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    ONBOARDING = "Onboarding",
    REJECTED = "Rejected",
    TERMINATED = "Terminated",
    ARCHIVED = "Archived",
}

export enum AccountType {
    ADMIN = "Admin",
    EMPLOYEE = "Employee",
    VENDOR = "Vendor",
    HOUSING_TENANT = "Housing_Tenant",
}

export enum RoleName {
    ADMIN = "Admin",
    EMPLOYEE = "Employee",
    VENDOR = "Vendor",
    MANAGEMENT = "Management",
    EXTERNAL_AFFAIRS = "External Affairs",
    HR = "HR",
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
    // Deletion lifecycle
    deleteRequested?: boolean;
    deleteRequestedAt?: Date | string;
    deletionApprovedAt?: Date | string;
    deletionApprovedBy?: string;
    deletionScheduledFor?: Date | string;
    anonymizedAt?: Date | string;
    isTransferableEmail?: boolean;
    legalHold?: boolean;
}

export interface Vendor {
    _id: string;
    userId: string | User; // Can be ObjectId or populated User
    website?: string;
    companyName: string;
    contactName: string; // Primary contact person for the vendor company
    contactEmail: string; // Contact email for the vendor company
    contactPhone?: string;
    physicalAddress?: Address;
    mailingAddress?: Address;
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

// Registration DTOs matching the new API
export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    physicalAddress: Address;
    mailingAddress?: Address;
    contactPhone?: string;
}

export interface RegisterEmployeeDto extends RegisterDto {
    employeeId?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string; // ISO date string
    managerId?: string;
}

export interface RegisterVendorDto extends RegisterDto {
    companyName: string;
    website?: string;
    contactName?: string;
    servicesOffered?: string[];
    contactEmail: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RefreshTokenDto {
    refreshToken?: string; // May be in httpOnly cookie
}

export interface UpdatePasswordDto {
    oldPassword: string;
    newPassword: string;
}

export interface RequestPasswordResetDto {
    email: string;
}

export interface ConfirmPasswordResetDto {
    token: string;
    newPassword: string;
}

export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    contactEmail?: string;
    contactPhone?: string;
    physicalAddress?: Address;
    mailingAddress?: Address;
}

export interface UserDetailsResponse {
    user: User;
    vendor?: Vendor;
    employee?: Employee;
}
