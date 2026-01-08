"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Contract } from "@/lib/types/contracts";
import { formatCurrency } from "@/lib/utils/formatters";
import { format, isPast } from "date-fns";
import {
    CalendarIcon,
    DollarSignIcon,
    FileTextIcon,
    UsersIcon,
    ClockIcon,
} from "lucide-react";
import { StatusBadge } from "../common";

interface ContractCardProps {
    contract: Contract;
    showApplicationCount?: boolean;
    className?: string;
}

export function ContractCard({
    contract,
    showApplicationCount = false,
    className,
}: ContractCardProps) {
    const hasDeadline = !!contract.deadline;
    const isExpired = hasDeadline && isPast(new Date(contract.deadline!));
    const applicationCount = contract.applicationCount ?? 0;

    return (
        <Card
            className={`hover:shadow-md transition-shadow ${className || ""}`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/contracts/${contract._id}`}
                            className="block hover:underline"
                        >
                            <h3 className="text-lg font-semibold truncate">
                                {contract.title}
                            </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {contract.description}
                        </p>
                    </div>
                    <StatusBadge type="contract" status={contract.status} />
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="space-y-2">
                    {/* Budget */}
                    {contract.budget !== undefined && contract.budget > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                                {formatCurrency(
                                    contract.budget,
                                    contract.currency || "USD"
                                )}
                            </span>
                        </div>
                    )}

                    {/* Deadline */}
                    {hasDeadline && (
                        <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span
                                className={
                                    isExpired
                                        ? "text-destructive font-medium"
                                        : ""
                                }
                            >
                                {isExpired ? "Expired: " : "Deadline: "}
                                {format(
                                    new Date(contract.deadline!),
                                    "MMM d, yyyy"
                                )}
                            </span>
                        </div>
                    )}

                    {/* Required Documents */}
                    {contract.requiredDocuments &&
                        contract.requiredDocuments.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileTextIcon className="h-4 w-4" />
                                <span>
                                    {contract.requiredDocuments.length} required
                                    document
                                    {contract.requiredDocuments.length !== 1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>
                        )}

                    {/* Responsive Support Badge */}
                    {contract.requiresResponsiveSupport && (
                        <Badge variant="secondary" className="w-fit">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Responsive Support
                        </Badge>
                    )}

                    {/* Application Count (staff view) */}
                    {showApplicationCount && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UsersIcon className="h-4 w-4" />
                            <span>
                                {applicationCount} application
                                {applicationCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <span>
                        Created by{" "}
                        {contract.createdBy.fullName ||
                            contract.createdBy.email}
                    </span>
                    <span>
                        {format(new Date(contract.createdAt), "MMM d, yyyy")}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}
