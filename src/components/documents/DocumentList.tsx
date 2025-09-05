"use client";

import { DocumentViewer } from "./DocumentViewer";

interface DocumentListProps {
    /** Single document ID or array of document IDs */
    documentIds: string | string[];
    /** Custom CSS classes */
    className?: string;
    /** Maximum number of documents to show initially */
    maxVisible?: number;
}

/**
 * Simple document list component - wrapper around DocumentViewer with compact settings
 * Perfect for HR documents, contract attachments, etc.
 */
export function DocumentList({ 
    documentIds, 
    className = "",
    maxVisible 
}: DocumentListProps) {
    return (
        <DocumentViewer
            documentIds={documentIds}
            displayMode="compact"
            showDownload={true}
            showView={true}
            showMetadata={false}
            maxVisible={maxVisible}
            className={className}
        />
    );
}
