"use client";

import { BaseDashboardCard } from "../BaseDashboardCard";
import useSWR from "swr";
import { ContractsService } from "@/lib/services/contracts";
import { Button } from "@/components/ui/button";
import { ExternalLink, Briefcase } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ContractStatus, type Contract } from "@/lib/types/contracts";

/**
 * OpenContractsCard shows currently open contracts vendors can apply to
 */
export function OpenContractsCard() {
    const { data, error } = useSWR("/open-contracts", async () => {
        const result = await ContractsService.listContracts({
            limit: 5,
            page: 1,
            status: ContractStatus.OPEN,
        });
        return result.data || [];
    });

    const isLoading = !data;
    const contracts = data || [];

    return (
        <BaseDashboardCard
            title="Open Contracts"
            isLoading={isLoading}
            error={error?.message}
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/contracts">
                        View All
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            }
        >
            {contracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Briefcase className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No open contracts available
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {contracts.map((contract: Contract) => (
                        <div
                            key={contract._id}
                            className="flex items-start justify-between gap-3 rounded-lg border p-3"
                        >
                            <div className="flex-1 space-y-1">
                                <Link
                                    href={`/contracts/public/${contract._id}`}
                                    className="font-medium hover:underline"
                                >
                                    {contract.title}
                                </Link>
                                {contract.deadline && (
                                    <p className="text-xs text-muted-foreground">
                                        Deadline:{" "}
                                        {formatDistanceToNow(
                                            new Date(contract.deadline),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </p>
                                )}
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={`/contracts/public/${contract._id}`}
                                >
                                    View
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </BaseDashboardCard>
    );
}
