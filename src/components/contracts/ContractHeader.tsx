"use client";

import { StatusBadge } from "../common";
import { Contract } from "@/lib/types/contracts";
import { sanitizeUserContent } from "@/lib/utils/sanitize";

interface ContractHeaderProps {
    contract: Contract;
}

export function ContractHeader({ contract }: ContractHeaderProps) {
    return (
        <div className="space-y-4">
            {/* Title and Status */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2 flex-1 min-w-0">
                    <h1 className="text-3xl font-bold break-words">
                        {contract.title}
                    </h1>
                </div>
                <StatusBadge
                    type="contract"
                    status={contract.status}
                    className="shrink-0 text-sm px-3 py-1"
                />
            </div>

            {/* Description */}
            <p
                className="text-muted-foreground text-lg"
                dangerouslySetInnerHTML={{
                    __html: sanitizeUserContent(contract.description),
                }}
            />
        </div>
    );
}
