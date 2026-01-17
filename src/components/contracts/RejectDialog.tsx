"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RejectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (reason?: string) => void | Promise<void>;
    loading?: boolean;
}

export function RejectDialog({
    open,
    onOpenChange,
    title = "Reject Application",
    description = "Are you sure you want to reject this application? This action will notify the vendor.",
    confirmText = "Reject",
    cancelText = "Cancel",
    onConfirm,
    loading = false,
}: RejectDialogProps) {
    const [reason, setReason] = useState("");

    async function handleConfirm() {
        await onConfirm(reason.trim() || undefined);
        setReason("");
        onOpenChange(false);
    }

    function handleOpenChange(isOpen: boolean) {
        if (!isOpen) {
            setReason("");
        }
        onOpenChange(isOpen);
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <Label
                        htmlFor="rejection-reason"
                        className="text-sm font-medium"
                    >
                        Reason (optional)
                    </Label>
                    <Textarea
                        id="rejection-reason"
                        placeholder="Provide a reason for rejection (visible to vendor)..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-2"
                        rows={3}
                        maxLength={1000}
                        disabled={loading}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        {reason.length}/1000 characters
                    </p>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? "Processing..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
