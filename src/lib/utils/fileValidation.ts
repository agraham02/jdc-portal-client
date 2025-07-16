import { FILE_UPLOAD_CONFIG, ERROR_MESSAGES } from "@/lib/constants/contracts";

export interface FileValidationOptions {
    allowedTypes: string[];
    allowedExtensions: string[];
    maxFileSize?: number;
    fileTypeLabel?: string;
}

/**
 * Validates a file against specified criteria
 * @param file - The file to validate
 * @param options - Validation options including allowed types, extensions, and size limits
 * @returns Error message if validation fails, null if validation passes
 */
export function validateFile(
    file: File,
    options: FileValidationOptions
): string | null {
    const {
        allowedTypes,
        allowedExtensions,
        maxFileSize = FILE_UPLOAD_CONFIG.MAX_FILE_SIZE,
        fileTypeLabel = "supported formats",
    } = options;

    // Check file size
    if (file.size > maxFileSize) {
        return ERROR_MESSAGES.FILE_TOO_LARGE(file.name);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            return ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE(
                file.name,
                fileTypeLabel
            );
        }
    }

    return null;
}

/**
 * Validates multiple files and returns arrays of valid files and error messages
 * @param files - Array of files to validate
 * @param options - Validation options
 * @param currentFileCount - Current number of files already selected
 * @param maxFiles - Maximum allowed files
 * @returns Object containing valid files and error messages
 */
export function validateMultipleFiles(
    files: File[],
    options: FileValidationOptions,
    currentFileCount: number = 0,
    maxFiles: number
): { validFiles: File[]; errors: string[] } {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
        const error = validateFile(file, options);
        if (error) {
            errors.push(error);
        } else {
            validFiles.push(file);
        }
    }

    // Check total number of files
    if (currentFileCount + validFiles.length > maxFiles) {
        errors.push(ERROR_MESSAGES.TOO_MANY_FILES(maxFiles));
        // Return only the files that fit within the limit
        const allowedNewFiles = maxFiles - currentFileCount;
        return {
            validFiles: validFiles.slice(0, allowedNewFiles),
            errors,
        };
    }

    return { validFiles, errors };
}

// Predefined validation configurations for common use cases
export const CONTRACT_FILE_VALIDATION: FileValidationOptions = {
    allowedTypes: FILE_UPLOAD_CONFIG.ALLOWED_CONTRACT_TYPES,
    allowedExtensions: FILE_UPLOAD_CONFIG.ALLOWED_CONTRACT_EXTENSIONS,
    fileTypeLabel: "PDF, DOC, DOCX, TXT",
};

export const APPLICATION_FILE_VALIDATION: FileValidationOptions = {
    allowedTypes: FILE_UPLOAD_CONFIG.ALLOWED_APPLICATION_TYPES,
    allowedExtensions: FILE_UPLOAD_CONFIG.ALLOWED_APPLICATION_EXTENSIONS,
    fileTypeLabel: "PDF, DOC, DOCX, TXT, JPG, PNG",
};
