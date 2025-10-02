"use client";

import { Badge } from "@/components/ui/badge";
import { ContractStatus, ApplicationStatus } from "@/lib/types/contracts";
import { cn } from "@/lib/utils";

interface StatusChipProps {
    status: ContractStatus | ApplicationStatus;
    className?: string;
}

const CONTRACT_STATUS_CONFIG: Record<
    ContractStatus,
    {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        className?: string;
    }
> = {
    [ContractStatus.DRAFT]: {
        label: "Draft",
        variant: "secondary",
        className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    [ContractStatus.OPEN]: {
        label: "Open",
        variant: "default",
        className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    [ContractStatus.CLOSED]: {
        label: "Closed",
        variant: "secondary",
        className:
            "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    },
    [ContractStatus.AWARDED]: {
        label: "Awarded",
        variant: "default",
        className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
};

const APPLICATION_STATUS_CONFIG: Record<
    ApplicationStatus,
    {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        className?: string;
    }
> = {
    [ApplicationStatus.SUBMITTED]: {
        label: "Submitted",
        variant: "outline",
        className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    },
    [ApplicationStatus.REVIEWED]: {
        label: "Under Review",
        variant: "outline",
        className:
            "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    },
    [ApplicationStatus.ACCEPTED]: {
        label: "Accepted",
        variant: "default",
        className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    [ApplicationStatus.REJECTED]: {
        label: "Rejected",
        variant: "destructive",
        className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
    [ApplicationStatus.WITHDRAWN]: {
        label: "Withdrawn",
        variant: "secondary",
        className:
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    [ApplicationStatus.CANCELLED]: {
        label: "Cancelled",
        variant: "secondary",
        className:
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
};

export function StatusChip({ status, className }: StatusChipProps) {
    const config = Object.values(ContractStatus).includes(
        status as ContractStatus
    )
        ? CONTRACT_STATUS_CONFIG[status as ContractStatus]
        : APPLICATION_STATUS_CONFIG[status as ApplicationStatus];

    if (!config) {
        return (
            <Badge variant="outline" className={className}>
                {status}
            </Badge>
        );
    }

    return (
        <Badge
            variant={config.variant}
            className={cn(config.className, className)}
        >
            {config.label}
        </Badge>
    );
}
