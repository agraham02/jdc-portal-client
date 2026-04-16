"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { AuthService } from "@/lib/services/auth";
import type { User, Role } from "@/lib/types/auth";
import { RoleName } from "@/lib/types/auth";

type DeletionFlow = "vendor-immediate" | "top-tier-confirm" | "request-only";

interface DeleteAccountDialogProps {
    user: User;
    onSuccess?: () => void;
}

/**
 * Role-aware account deletion dialog.
 *
 * - Vendor: short confirmation, account is scheduled for deletion immediately
 *   with a short grace window.
 * - Top-tier manager (admin / management, presumed to have no manager above):
 *   requires the literal phrase "DELETE MY ACCOUNT" plus password re-verification
 *   before scheduling deletion with a long grace window.
 * - Regular employee / manager: submits a deletion request for admin/manager
 *   approval. Account remains active until approved.
 *
 * The server is the source of truth for classification; this component only
 * tailors the UX.
 */
export function DeleteAccountDialog({
    user,
    onSuccess,
}: DeleteAccountDialogProps) {
    const flow = useMemo<DeletionFlow>(() => deriveFlow(user), [user]);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [phrase, setPhrase] = useState("");
    const [password, setPassword] = useState("");

    const requestedAlready =
        !!user.deleteRequested || !!user.deletionScheduledFor;

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const body =
                flow === "top-tier-confirm"
                    ? { confirmationPhrase: phrase, password }
                    : undefined;
            const res = await AuthService.requestAccountDeletion(body);
            if (res.status === "scheduled" && res.scheduledFor) {
                toast.success(
                    `Account scheduled for deletion on ${new Date(
                        res.scheduledFor,
                    ).toLocaleDateString()}`,
                );
            } else {
                toast.success(
                    res.message ||
                        "Deletion request submitted. An administrator or your manager will review it.",
                );
            }
            setOpen(false);
            setPhrase("");
            setPassword("");
            onSuccess?.();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast.error(err.message || "Failed to process deletion request");
        } finally {
            setSubmitting(false);
        }
    }

    const canSubmit =
        flow !== "top-tier-confirm" ||
        (phrase.trim() === "DELETE MY ACCOUNT" && password.length > 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" disabled={requestedAlready}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {requestedAlready
                        ? "Deletion Pending"
                        : flow === "request-only"
                          ? "Request Account Deletion"
                          : "Delete Account"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        {flow === "top-tier-confirm" ? (
                            <ShieldAlert className="h-5 w-5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5" />
                        )}
                        {flow === "request-only"
                            ? "Request Account Deletion"
                            : "Delete Account"}
                    </DialogTitle>
                    <DialogDescription>
                        {flow === "vendor-immediate" && (
                            <>
                                Your account will be archived immediately and
                                permanently anonymized after a short grace
                                window. You can cancel by contacting support
                                during the grace window.
                            </>
                        )}
                        {flow === "top-tier-confirm" && (
                            <>
                                This is a high-impact action. Your account will
                                be archived now and permanently anonymized after
                                the organization&apos;s grace window. Type the
                                confirmation phrase and re-enter your password
                                to proceed.
                            </>
                        )}
                        {flow === "request-only" && (
                            <>
                                Submit a deletion request for review. An
                                administrator or your direct manager will
                                approve it. Your account remains active until
                                then.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {flow === "top-tier-confirm" && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="delete-phrase">
                                Type{" "}
                                <span className="font-mono font-semibold">
                                    DELETE MY ACCOUNT
                                </span>{" "}
                                to confirm
                            </Label>
                            <Input
                                id="delete-phrase"
                                value={phrase}
                                onChange={(e) => setPhrase(e.target.value)}
                                placeholder="DELETE MY ACCOUNT"
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delete-password">
                                Re-enter your password
                            </Label>
                            <PasswordInput
                                id="delete-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                    </motion.div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={submitting || !canSubmit}
                    >
                        {submitting
                            ? "Processing..."
                            : flow === "request-only"
                              ? "Submit Request"
                              : "Delete My Account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function deriveFlow(user: User): DeletionFlow {
    const roleNames = extractRoleNames(user.roles);
    if (roleNames.includes(RoleName.VENDOR)) return "vendor-immediate";
    const elevated =
        roleNames.includes(RoleName.ADMIN) ||
        roleNames.includes(RoleName.MANAGEMENT);
    // Server authoritatively checks managerId; if elevated we present the
    // stricter flow. Non-top-tier elevated users will get a request-only
    // response from the server, which is still handled gracefully.
    return elevated ? "top-tier-confirm" : "request-only";
}

function extractRoleNames(roles: User["roles"]): string[] {
    if (!Array.isArray(roles)) return [];
    const names: string[] = [];
    for (const r of roles) {
        if (typeof r === "string") continue;
        const name = (r as Role).name;
        if (typeof name === "string") names.push(name);
    }
    return names;
}
