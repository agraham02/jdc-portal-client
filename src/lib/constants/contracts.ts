import {
    ContractStatus,
    ContractApplicationStatus,
} from "@/lib/types/contract";

// Contract status styling
export const CONTRACT_STATUS_COLORS = {
    [ContractStatus.OPEN]: "bg-green-500",
    [ContractStatus.IN_PROGRESS]: "bg-blue-500",
    [ContractStatus.AWARDED]: "bg-purple-500",
    [ContractStatus.CLOSED]: "bg-gray-500",
} as const;

export const CONTRACT_STATUS_LABELS = {
    [ContractStatus.OPEN]: "Open",
    [ContractStatus.IN_PROGRESS]: "In Progress",
    [ContractStatus.AWARDED]: "Awarded",
    [ContractStatus.CLOSED]: "Closed",
} as const;

// Application status styling
export const APPLICATION_STATUS_COLORS = {
    [ContractApplicationStatus.SUBMITTED]: "bg-blue-100 text-blue-800",
    [ContractApplicationStatus.REVIEWED]: "bg-yellow-100 text-yellow-800",
    [ContractApplicationStatus.ACCEPTED]: "bg-green-100 text-green-800",
    [ContractApplicationStatus.REJECTED]: "bg-red-100 text-red-800",
} as const;

export const APPLICATION_STATUS_LABELS = {
    [ContractApplicationStatus.SUBMITTED]: "Submitted",
    [ContractApplicationStatus.REVIEWED]: "Under Review",
    [ContractApplicationStatus.ACCEPTED]: "Accepted",
    [ContractApplicationStatus.REJECTED]: "Rejected",
} as const;

// File upload constants
export const FILE_UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES_APPLICATION: 5,
    MAX_FILES_CONTRACT: 10,
    ALLOWED_APPLICATION_TYPES: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
    ] as string[],
    ALLOWED_CONTRACT_TYPES: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ] as string[],
    ALLOWED_APPLICATION_EXTENSIONS: [
        ".pdf",
        ".doc",
        ".docx",
        ".txt",
        ".jpg",
        ".jpeg",
        ".png",
    ] as string[],
    ALLOWED_CONTRACT_EXTENSIONS: [".pdf", ".doc", ".docx", ".txt"] as string[],
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
    UNAUTHORIZED: "You don't have permission to perform this action.",
    TIMEOUT: "Request timed out. Please try again.",
    FILE_UPLOAD_ERROR:
        "File upload failed. Please check your files and try again.",
    VALIDATION_ERROR: "Please check your input and try again.",
    FILE_TOO_LARGE: (filename: string) =>
        `File "${filename}" is too large. Maximum size is 10MB.`,
    UNSUPPORTED_FILE_TYPE: (filename: string, allowedTypes: string) =>
        `File "${filename}" has an unsupported format. Allowed formats: ${allowedTypes}.`,
    TOO_MANY_FILES: (maxFiles: number) =>
        `You can upload a maximum of ${maxFiles} files.`,
} as const;
