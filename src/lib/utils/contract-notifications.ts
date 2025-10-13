import { toast } from "sonner";
import { NotificationType, Notification } from "@/lib/types/notifications";

/**
 * Contract-related notification data interfaces
 */
export interface ContractNotificationData {
    contractId?: string;
    contractTitle?: string;
    applicationId?: string;
    vendorName?: string;
    companyName?: string;
    documentName?: string;
    reason?: string;
}

/**
 * Handle contract-related notifications with appropriate UI updates
 * @param notification - The notification object from the backend
 * @param callbacks - Optional callbacks for data refresh
 */
export function handleContractNotification(
    notification: Notification,
    callbacks?: {
        onContractUpdate?: (contractId: string) => void;
        onApplicationUpdate?: (applicationId: string) => void;
        onContractListUpdate?: () => void;
        onApplicationListUpdate?: () => void;
    }
) {
    const { type, title, message, data } = notification;
    const notificationData = data as ContractNotificationData;

    switch (type) {
        case NotificationType.CONTRACT_PUBLISHED:
            toast.info(title || "New Contract Available", {
                description:
                    message ||
                    `Contract "${notificationData.contractTitle}" is now open for applications`,
            });
            callbacks?.onContractListUpdate?.();
            break;

        case NotificationType.CONTRACT_CREATED:
            toast.success(title || "Contract Created", {
                description:
                    message ||
                    `Contract "${notificationData.contractTitle}" has been created`,
            });
            callbacks?.onContractListUpdate?.();
            break;

        case NotificationType.CONTRACT_UPDATED:
            toast.info(title || "Contract Updated", {
                description:
                    message ||
                    `Contract "${notificationData.contractTitle}" has been updated`,
            });
            if (notificationData.contractId) {
                callbacks?.onContractUpdate?.(notificationData.contractId);
            }
            break;

        case NotificationType.CONTRACT_AWARDED:
            toast.success(title || "Contract Awarded", {
                description:
                    message ||
                    `Contract "${notificationData.contractTitle}" has been awarded`,
            });
            if (notificationData.contractId) {
                callbacks?.onContractUpdate?.(notificationData.contractId);
            }
            callbacks?.onContractListUpdate?.();
            break;

        case NotificationType.CONTRACT_DEADLINE_APPROACHING:
            toast.warning(title || "Deadline Approaching", {
                description:
                    message ||
                    `Contract "${notificationData.contractTitle}" deadline is approaching`,
            });
            break;

        case NotificationType.CONTRACT_DOCUMENT_UPLOADED:
            toast.info(title || "Document Uploaded", {
                description:
                    message ||
                    `New document "${notificationData.documentName}" uploaded to contract`,
            });
            if (notificationData.contractId) {
                callbacks?.onContractUpdate?.(notificationData.contractId);
            }
            break;

        case NotificationType.APPLICATION_SUBMITTED:
            toast.info(title || "Application Submitted", {
                description:
                    message ||
                    `${
                        notificationData.vendorName || "A vendor"
                    } submitted an application`,
            });
            callbacks?.onApplicationListUpdate?.();
            break;

        case NotificationType.APPLICATION_ACCEPTED:
            toast.success(title || "Application Accepted", {
                description:
                    message ||
                    "Congratulations! Your application has been accepted.",
            });
            if (notificationData.applicationId) {
                callbacks?.onApplicationUpdate?.(
                    notificationData.applicationId
                );
            }
            callbacks?.onApplicationListUpdate?.();
            break;

        case NotificationType.APPLICATION_REJECTED:
            toast.error(title || "Application Rejected", {
                description:
                    message ||
                    "Unfortunately, your application was not selected.",
            });
            if (notificationData.applicationId) {
                callbacks?.onApplicationUpdate?.(
                    notificationData.applicationId
                );
            }
            callbacks?.onApplicationListUpdate?.();
            break;

        case NotificationType.APPLICATION_WITHDRAWN:
            toast.info(title || "Application Withdrawn", {
                description:
                    message ||
                    `${
                        notificationData.vendorName || "A vendor"
                    } withdrew their application`,
            });
            callbacks?.onApplicationListUpdate?.();
            break;

        case NotificationType.APPLICATION_CANCELLED:
            toast.warning(title || "Application Cancelled", {
                description:
                    message ||
                    `Your application has been cancelled${
                        notificationData.reason
                            ? `: ${notificationData.reason}`
                            : "."
                    }`,
            });
            if (notificationData.applicationId) {
                callbacks?.onApplicationUpdate?.(
                    notificationData.applicationId
                );
            }
            callbacks?.onApplicationListUpdate?.();
            break;

        default:
            // Not a contract-related notification, ignore
            break;
    }
}

/**
 * Check if a notification is contract-related
 */
export function isContractNotification(type: NotificationType): boolean {
    return [
        NotificationType.CONTRACT_PUBLISHED,
        NotificationType.CONTRACT_CREATED,
        NotificationType.CONTRACT_UPDATED,
        NotificationType.CONTRACT_AWARDED,
        NotificationType.CONTRACT_DEADLINE_APPROACHING,
        NotificationType.CONTRACT_DOCUMENT_UPLOADED,
        NotificationType.APPLICATION_SUBMITTED,
        NotificationType.APPLICATION_ACCEPTED,
        NotificationType.APPLICATION_REJECTED,
        NotificationType.APPLICATION_WITHDRAWN,
        NotificationType.APPLICATION_CANCELLED,
    ].includes(type);
}

/**
 * Show success toast for contract actions
 */
export function showContractActionSuccess(action: string, details?: string) {
    toast.success(`${action} Successful`, {
        description: details,
    });
}

/**
 * Show error toast for contract actions
 */
export function showContractActionError(action: string, error: string) {
    toast.error(`${action} Failed`, {
        description: error,
    });
}
