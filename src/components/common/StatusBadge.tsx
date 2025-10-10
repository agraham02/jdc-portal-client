import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { UserStatus } from "@/lib/types/auth";
import { ContractStatus, ApplicationStatus } from "@/lib/types/contracts";

export type { UserStatus, ContractStatus, ApplicationStatus };

// Discriminated union for type-safe props
type StatusBadgeProps =
    | {
          type: "user";
          status: UserStatus | undefined | null;
          showIcon?: boolean;
          className?: string;
      }
    | {
          type: "contract";
          status: ContractStatus | undefined | null;
          showIcon?: boolean;
          className?: string;
      }
    | {
          type: "application";
          status: ApplicationStatus | undefined | null;
          showIcon?: boolean;
          className?: string;
      };

type StatusConfig = {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
    icon: typeof CheckCircle;
};

// Type-safe config using enum keys
const userStatusConfig: Record<UserStatus, StatusConfig> = {
    [UserStatus.ACTIVE]: {
        label: "Active",
        variant: "default",
        className:
            "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600",
        icon: CheckCircle,
    },
    [UserStatus.INACTIVE]: {
        label: "Inactive",
        variant: "secondary",
        className: "bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600",
        icon: XCircle,
    },
    [UserStatus.PENDING]: {
        label: "Pending",
        variant: "secondary",
        className:
            "bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600",
        icon: Clock,
    },
    [UserStatus.REJECTED]: {
        label: "Rejected",
        variant: "destructive",
        className:
            "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:text-red-100",
        icon: AlertCircle,
    },
    [UserStatus.TERMINATED]: {
        label: "Terminated",
        variant: "destructive",
        className: "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600",
        icon: XCircle,
    },
    [UserStatus.ONBOARDING]: {
        label: "Onboarding",
        variant: "secondary",
        className: "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600",
        icon: Clock,
    },
    [UserStatus.ARCHIVED]: {
        label: "Archived",
        variant: "secondary",
        className: "bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600",
        icon: XCircle,
    },
};

const contractStatusConfig: Record<ContractStatus, StatusConfig> = {
    [ContractStatus.DRAFT]: {
        label: "Draft",
        variant: "secondary",
        className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        icon: Clock,
    },
    [ContractStatus.OPEN]: {
        label: "Open",
        variant: "default",
        className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        icon: CheckCircle,
    },
    [ContractStatus.CLOSED]: {
        label: "Closed",
        variant: "secondary",
        className:
            "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        icon: XCircle,
    },
    [ContractStatus.AWARDED]: {
        label: "Awarded",
        variant: "default",
        className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        icon: CheckCircle,
    },
};

const applicationStatusConfig: Record<ApplicationStatus, StatusConfig> = {
    [ApplicationStatus.SUBMITTED]: {
        label: "Submitted",
        variant: "outline",
        className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        icon: Clock,
    },
    [ApplicationStatus.REVIEWED]: {
        label: "Under Review",
        variant: "outline",
        className:
            "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
        icon: Clock,
    },
    [ApplicationStatus.ACCEPTED]: {
        label: "Accepted",
        variant: "default",
        className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        icon: CheckCircle,
    },
    [ApplicationStatus.REJECTED]: {
        label: "Rejected",
        variant: "destructive",
        className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        icon: XCircle,
    },
    [ApplicationStatus.WITHDRAWN]: {
        label: "Withdrawn",
        variant: "secondary",
        className:
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        icon: XCircle,
    },
    [ApplicationStatus.CANCELLED]: {
        label: "Cancelled",
        variant: "secondary",
        className:
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        icon: XCircle,
    },
};

/**
 * StatusBadge - Type-safe status badge using discriminated unions
 *
 * Features:
 * - Fully type-safe with discriminated union pattern
 * - Color-coded by status type
 * - Optional icon
 * - Consistent styling across all status types
 * - Dark mode support
 * - Prevents enum key collisions (e.g., UserStatus.REJECTED vs ApplicationStatus.REJECTED)
 *
 * Usage:
 * ```tsx
 * // User status - requires type="user"
 * <StatusBadge type="user" status={UserStatus.ACTIVE} showIcon />
 *
 * // Contract status - requires type="contract"
 * <StatusBadge type="contract" status={ContractStatus.OPEN} />
 *
 * // Application status - requires type="application"
 * <StatusBadge type="application" status={ApplicationStatus.SUBMITTED} showIcon />
 * ```
 */
export function StatusBadge(props: StatusBadgeProps) {
    const { status, showIcon = true, className } = props;

    if (!status) {
        return (
            <Badge variant="secondary" className={cn("w-fit", className)}>
                <span>Unknown</span>
            </Badge>
        );
    }

    // Type-safe config lookup based on discriminated union
    let config: StatusConfig;

    switch (props.type) {
        case "user":
            config = userStatusConfig[status as UserStatus];
            break;
        case "contract":
            config = contractStatusConfig[status as ContractStatus];
            break;
        case "application":
            config = applicationStatusConfig[status as ApplicationStatus];
            break;
        default:
            // Exhaustive check - TypeScript will error if we miss a case
            const _exhaustive: never = props;
            return _exhaustive;
    }

    if (!config) {
        // Fallback for unknown status
        return (
            <Badge variant="secondary" className={cn("w-fit", className)}>
                <span>{status}</span>
            </Badge>
        );
    }

    const Icon = config.icon;

    return (
        <Badge
            variant={config.variant}
            className={cn(
                "flex items-center gap-1 w-fit",
                config.className,
                className
            )}
        >
            {showIcon && <Icon className="h-3 w-3" />}
            <span>{config.label}</span>
        </Badge>
    );
}
