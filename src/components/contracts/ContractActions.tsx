"use client";

import { Button } from "@/components/ui/button";
import { Contract, ContractStatus } from "@/lib/types/contracts";
import { Can } from "@/components/auth/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useAuth } from "@/lib/contexts/auth-context";
import { AccountType } from "@/lib/types/auth";
import {
    EditIcon,
    SendIcon,
    XCircleIcon,
    TrophyIcon,
    TrashIcon,
    CheckCircleIcon,
    FileTextIcon,
} from "lucide-react";
import Link from "next/link";

interface ContractActionsProps {
    contract: Contract;
    isLoading: boolean;
    onPublish?: () => void;
    onClose?: () => void;
    onAward?: () => void;
    onDelete?: () => void;
    onApply?: () => void;
}

export function ContractActions({
    contract,
    isLoading,
    onPublish,
    onClose,
    onAward,
    onDelete,
    onApply,
}: ContractActionsProps) {
    const { accountType, hasPermission } = useAuth();
    const isDraft = contract.status === ContractStatus.DRAFT;
    const isOpen = contract.status === ContractStatus.OPEN;
    const isAwarded = contract.status === ContractStatus.AWARDED;

    // Apply button should only be visible to vendors OR admins (SYSTEM_ADMIN)
    const isVendor = accountType === AccountType.VENDOR;
    const isAdmin = hasPermission(P.SYSTEM_ADMIN);
    const canApply = isVendor || isAdmin;

    return (
        <div className="flex flex-wrap gap-3">
            {/* Edit (for staff, only if draft) */}
            <Can anyOf={[P.CONTRACT_UPDATE]}>
                {isDraft && (
                    <Link href={`/contracts/${contract._id}/edit`}>
                        <Button variant="outline" disabled={isLoading}>
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit Contract
                        </Button>
                    </Link>
                )}
            </Can>

            {/* Publish (for staff, only if draft) */}
            <Can anyOf={[P.CONTRACT_PUBLISH]}>
                {isDraft && onPublish && (
                    <Button onClick={onPublish} disabled={isLoading}>
                        <SendIcon className="mr-2 h-4 w-4" />
                        Publish Contract
                    </Button>
                )}
            </Can>

            {/* Close (for staff, only if open) */}
            <Can anyOf={[P.CONTRACT_UPDATE]}>
                {isOpen && onClose && (
                    <Button
                        onClick={onClose}
                        variant="outline"
                        disabled={isLoading}
                    >
                        <XCircleIcon className="mr-2 h-4 w-4" />
                        Close Contract
                    </Button>
                )}
            </Can>

            {/* Award (for staff, only if open and onAward provided) */}
            <Can anyOf={[P.CONTRACT_APPROVE]}>
                {isOpen && onAward && (
                    <Button onClick={onAward} disabled={isLoading}>
                        <TrophyIcon className="mr-2 h-4 w-4" />
                        Award Contract
                    </Button>
                )}
            </Can>

            {/* Delete (for staff only) */}
            <Can anyOf={[P.CONTRACT_DELETE]}>
                {onDelete && (
                    <Button
                        onClick={onDelete}
                        variant="destructive"
                        disabled={isLoading}
                    >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                )}
            </Can>

            {/* Apply (for vendors or admins only, if open) */}
            {canApply && (
                <Can anyOf={[P.CONTRACT_APPLY]}>
                    {isOpen && onApply && (
                        <Button onClick={onApply} disabled={isLoading}>
                            <CheckCircleIcon className="mr-2 h-4 w-4" />
                            Apply to Contract
                        </Button>
                    )}
                </Can>
            )}

            {/* View/Manage Applications - scroll to applications section */}
            <Can anyOf={[P.CONTRACT_MANAGE_APPLICATIONS]}>
                {(isOpen || isAwarded) && (
                    <a href="#applications">
                        <Button variant="outline" disabled={isLoading}>
                            <FileTextIcon className="mr-2 h-4 w-4" />
                            {isAwarded
                                ? "View Applications"
                                : "Review Applications"}
                        </Button>
                    </a>
                )}
            </Can>
        </div>
    );
}
