import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Eye, FileText, Users } from "lucide-react";
import { Contract, ContractStatus } from "@/lib/types/contract";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ContractCardProps {
    contract: Contract;
    showActions?: boolean;
    onApply?: (contractId: string) => void;
    isVendor?: boolean;
    hasApplied?: boolean;
}

const statusColors = {
    [ContractStatus.OPEN]: "bg-green-500",
    [ContractStatus.IN_PROGRESS]: "bg-blue-500",
    [ContractStatus.AWARDED]: "bg-purple-500",
    [ContractStatus.CLOSED]: "bg-gray-500",
};

const statusLabels = {
    [ContractStatus.OPEN]: "Open",
    [ContractStatus.IN_PROGRESS]: "In Progress",
    [ContractStatus.AWARDED]: "Awarded",
    [ContractStatus.CLOSED]: "Closed",
};

export function ContractCard({
    contract,
    showActions = true,
    onApply,
    isVendor = false,
    hasApplied = false,
}: ContractCardProps) {
    const isDeadlineApproaching =
        contract.deadline &&
        new Date(contract.deadline) <
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return (
        <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-2">
                            {contract.title}
                        </CardTitle>
                        <Badge
                            className={`${
                                statusColors[contract.status]
                            } text-white`}
                        >
                            {statusLabels[contract.status]}
                        </Badge>
                    </div>
                    {contract.deadline && (
                        <div
                            className={`text-sm ${
                                isDeadlineApproaching
                                    ? "text-red-600 font-medium"
                                    : "text-gray-600"
                            }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Due{" "}
                            {formatDistanceToNow(new Date(contract.deadline), {
                                addSuffix: true,
                            })}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm line-clamp-3">
                    {contract.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    {contract.budget && (
                        <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>${contract.budget.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{contract.applications.length} applications</span>
                    </div>
                    {contract.documents && contract.documents.length > 0 && (
                        <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            <span>{contract.documents.length} documents</span>
                        </div>
                    )}
                    <div className="text-xs text-gray-500">
                        Created{" "}
                        {formatDistanceToNow(new Date(contract.createdAt), {
                            addSuffix: true,
                        })}
                    </div>
                </div>

                {showActions && (
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1"
                        >
                            <Link href={`/contracts/${contract._id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </Link>
                        </Button>

                        {isVendor &&
                            contract.status === ContractStatus.OPEN && (
                                <>
                                    {hasApplied ? (
                                        <Badge
                                            variant="secondary"
                                            className="px-3 py-1"
                                        >
                                            Applied
                                        </Badge>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                onApply?.(contract._id)
                                            }
                                            disabled={
                                                !contract.deadline ||
                                                new Date(contract.deadline) <
                                                    new Date()
                                            }
                                        >
                                            Apply
                                        </Button>
                                    )}
                                </>
                            )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
