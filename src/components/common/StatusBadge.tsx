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
            "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600",
        icon: CheckCircle,
    },
    [UserStatus.INACTIVE]: {
        label: "Inactive",
        variant: "secondary",
        className: "bg-muted text-muted-foreground",
        icon: XCircle,
    },
    [UserStatus.PENDING]: {
        label: "Pending",
        variant: "secondary",
        className:
            "bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600",
        icon: Clock,
    },
    [UserStatus.REJECTED]: {
        label: "Rejected",
        variant: "destructive",
        className: "",
        icon: AlertCircle,
    },
    [UserStatus.TERMINATED]: {
        label: "Terminated",
        variant: "destructive",
        className: "",
        icon: XCircle,
    },
    [UserStatus.ONBOARDING]: {
        label: "Onboarding",
        variant: "secondary",
        className: "bg-primary hover:bg-primary/90 text-primary-foreground",
        icon: Clock,
    },
    [UserStatus.ARCHIVED]: {
        label: "Archived",
        variant: "secondary",
        className: "bg-muted text-muted-foreground",
        icon: XCircle,
    },
};

const contractStatusConfig: Record<ContractStatus, StatusConfig> = {
    [ContractStatus.DRAFT]: {
        label: "Draft",
        variant: "secondary",
        className: "",
        icon: Clock,
    },
    [ContractStatus.OPEN]: {
        label: "Open",
        variant: "default",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
        icon: CheckCircle,
    },
    [ContractStatus.CLOSED]: {
        label: "Closed",
        variant: "secondary",
        className:
            "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
        icon: XCircle,
    },
    [ContractStatus.AWARDED]: {
        label: "Awarded",
        variant: "default",
        className:
            "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
        icon: CheckCircle,
    },
};

const applicationStatusConfig: Record<ApplicationStatus, StatusConfig> = {
    [ApplicationStatus.SUBMITTED]: {
        label: "Submitted",
        variant: "outline",
        className:
            "bg-primary/5 text-primary border-primary/20 dark:bg-primary/10 dark:text-primary dark:border-primary/30",
        icon: Clock,
    },
    [ApplicationStatus.REVIEWED]: {
        label: "Under Review",
        variant: "outline",
        className:
            "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
        icon: Clock,
    },
    [ApplicationStatus.ACCEPTED]: {
        label: "In Review",
        variant: "outline",
        className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
        icon: Clock,
    },
    [ApplicationStatus.AWARDED]: {
        label: "Awarded",
        variant: "default",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
        icon: CheckCircle,
    },
    [ApplicationStatus.REJECTED]: {
        label: "Rejected",
        variant: "destructive",
        className: "",
        icon: XCircle,
    },
    [ApplicationStatus.WITHDRAWN]: {
        label: "Withdrawn",
        variant: "secondary",
        className: "",
        icon: XCircle,
    },
    [ApplicationStatus.CANCELLED]: {
        label: "Cancelled",
        variant: "secondary",
        className: "",
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
                className,
            )}
        >
            {showIcon && <Icon className="h-3 w-3" />}
            <span>{config.label}</span>
        </Badge>
    );
}
