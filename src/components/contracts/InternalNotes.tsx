"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Plus, Trash2, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "./ConfirmDialog";
import { Can } from "@/components/auth/Can";
import { PermissionName } from "@/lib/constants/permission-names";
import { cn } from "@/lib/utils";
import type { InternalNote } from "@/lib/types/contracts";

interface InternalNotesProps {
    applicationId?: string;
    notes: InternalNote[];
    isLoading?: boolean;
    onCreate?: (content: string, applicationId?: string) => Promise<void>;
    onDelete?: (noteId: string) => Promise<void>;
    className?: string;
}

export function InternalNotes({
    applicationId,
    notes,
    isLoading = false,
    onCreate,
    onDelete,
    className,
}: InternalNotesProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateNote = async () => {
        if (!newNoteContent.trim() || !onCreate) return;

        setIsSubmitting(true);
        try {
            await onCreate(newNoteContent, applicationId);
            setNewNoteContent("");
            setIsCreating(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async () => {
        if (!noteToDelete || !onDelete) return;

        setIsSubmitting(true);
        try {
            await onDelete(noteToDelete);
            setDeleteDialogOpen(false);
            setNoteToDelete(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteDialog = (noteId: string) => {
        setNoteToDelete(noteId);
        setDeleteDialogOpen(true);
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Can
            anyOf={[
                PermissionName.INTERNAL_NOTE_CREATE,
                PermissionName.INTERNAL_NOTE_READ,
            ]}
        >
            <Card className={cn("w-full", className)}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            Internal Notes
                            {notes && notes.length > 0 && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({notes.length})
                                </span>
                            )}
                        </CardTitle>
                        <Can anyOf={[PermissionName.INTERNAL_NOTE_CREATE]}>
                            {!isCreating && (
                                <Button
                                    size="sm"
                                    onClick={() => setIsCreating(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Note
                                </Button>
                            )}
                        </Can>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Create new note */}
                        {isCreating && (
                            <Card className="border-2 border-primary">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Write your internal note here..."
                                            value={newNoteContent}
                                            onChange={(e) =>
                                                setNewNoteContent(
                                                    e.target.value
                                                )
                                            }
                                            className="min-h-[100px] resize-y"
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setIsCreating(false);
                                                    setNewNoteContent("");
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCreateNote}
                                                disabled={
                                                    !newNoteContent.trim() ||
                                                    isSubmitting
                                                }
                                            >
                                                {isSubmitting && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Add Note
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Existing notes */}
                        {(!notes || notes.length === 0) && !isCreating ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">
                                    No internal notes yet
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Add notes to keep track of internal
                                    discussions and decisions.
                                </p>
                            </div>
                        ) : (
                            notes?.map((note) => (
                                <Card key={note._id}>
                                    <CardContent className="pt-6">
                                        <div className="mb-3 flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {typeof note.createdBy ===
                                                        "object"
                                                            ? `${note.createdBy.firstName} ${note.createdBy.lastName}`
                                                            : "Unknown User"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                note.createdAt
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <Can
                                                anyOf={[
                                                    PermissionName.INTERNAL_NOTE_DELETE,
                                                ]}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openDeleteDialog(
                                                            note._id
                                                        )
                                                    }
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </Can>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm">
                                            {note.content}
                                        </p>
                                        {note.applicationId && (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Linked to application
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>

                {/* Delete confirmation dialog */}
                <ConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Delete Internal Note"
                    description="Are you sure you want to delete this note? This action cannot be undone."
                    onConfirm={handleDeleteNote}
                    variant="destructive"
                />
            </Card>
        </Can>
    );
}
