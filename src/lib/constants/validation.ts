/**
 * Centralized validation constants
 *
 * These constants define validation rules used across the application
 * and should match backend DTO validation where applicable.
 */

// ============================================
// Address Field Constraints
// ============================================
export const ADDRESS_CONSTRAINTS = {
    LINE1_MAX_LENGTH: 100,
    LINE2_MAX_LENGTH: 100,
    CITY_MAX_LENGTH: 50,
    STATE_LENGTH: 2,
    ZIP_MAX_LENGTH: 20,
} as const;

// ============================================
// Text Field Constraints
// ============================================
export const TEXT_CONSTRAINTS = {
    FIRST_NAME_MAX_LENGTH: 100,
    LAST_NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 320,
    PHONE_MAX_LENGTH: 50,
    /**
     * Proposal minimum length
     * - Development: 0 (for easier testing)
     * - Production: 50 (meaningful content required)
     *
     * IMPORTANT: This must match backend validation in:
     * jdc-portal-api/src/contract-applications/dto.ts (CreateApplicationDto.proposal)
     */
    PROPOSAL_MIN_LENGTH: process.env.NODE_ENV === "development" ? 0 : 50,
    PROPOSAL_MAX_LENGTH: 10000,
} as const;

// ============================================
// Validation Patterns
// ============================================
export const VALIDATION_PATTERNS = {
    // US state code: exactly 2 uppercase letters
    STATE_CODE: /^[A-Z]{2}$/,
    // ZIP code: alphanumeric, spaces, and hyphens (supports US and international formats)
    ZIP_CODE: /^[A-Za-z0-9\s-]+$/,
    // E.164 phone format: +[country code][number]
    PHONE_E164: /^\+[1-9]\d{1,14}$/,
    // Email: basic email validation
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Country code: exactly 2 uppercase letters (ISO 3166-1 alpha-2)
    COUNTRY_CODE: /^[A-Z]{2}$/,
} as const;

// ============================================
// Validation Error Messages
// ============================================
export const VALIDATION_MESSAGES = {
    // Address
    ADDRESS_LINE1_REQUIRED:
        "Address line 1 is required when providing an address",
    ADDRESS_LINE1_MAX: `Address line 1 cannot exceed ${ADDRESS_CONSTRAINTS.LINE1_MAX_LENGTH} characters`,
    ADDRESS_LINE2_MAX: `Address line 2 cannot exceed ${ADDRESS_CONSTRAINTS.LINE2_MAX_LENGTH} characters`,
    CITY_REQUIRED: "City is required when providing an address",
    CITY_MAX: `City cannot exceed ${ADDRESS_CONSTRAINTS.CITY_MAX_LENGTH} characters`,
    STATE_REQUIRED: "State is required when providing an address",
    STATE_FORMAT: "State must be a valid 2-letter US state code (e.g., IL, CA)",
    ZIP_REQUIRED: "ZIP code is required when providing an address",
    ZIP_FORMAT: "ZIP code format is invalid",
    ZIP_MAX: `ZIP code cannot exceed ${ADDRESS_CONSTRAINTS.ZIP_MAX_LENGTH} characters`,

    // General
    REQUIRED_FIELD: "This field is required",
    EMAIL_INVALID: "Please enter a valid email address",
    PHONE_INVALID: "Please enter a valid phone number in format +1234567890",

    // Proposal
    PROPOSAL_REQUIRED: "Proposal details are required",
    PROPOSAL_MIN: `Proposal must be at least ${TEXT_CONSTRAINTS.PROPOSAL_MIN_LENGTH} characters`,
    PROPOSAL_MAX: `Proposal cannot exceed ${TEXT_CONSTRAINTS.PROPOSAL_MAX_LENGTH} characters`,
} as const;
