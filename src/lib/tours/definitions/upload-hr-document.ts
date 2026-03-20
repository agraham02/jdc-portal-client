import type { TourDefinition } from "../types";

export const uploadHrDocumentTour: TourDefinition = {
    id: "upload-hr-document",
    title: "Upload an HR Document",
    description:
        "Step-by-step walkthrough of uploading a document to the HR resources library.",
    roles: ["Admin", "HR"],
    startPath: "/hr-resources/upload",
    stepMeta: {
        2: { navigateTo: "/hr-resources/upload" },
        3: { navigateTo: "/hr-resources/upload" },
        4: { navigateTo: "/hr-resources/upload" },
    },
    steps: [
        {
            popover: {
                title: "Upload an HR Document 📄",
                description:
                    "This tour shows you how to upload documents to the HR resources library for your organization.",
            },
        },
        {
            element: "[data-tour='hr-upload-form']",
            popover: {
                title: "Upload Form",
                description:
                    "This is the document upload form. You'll select a file, add a description, choose a category, and set visibility.",
                side: "left",
            },
        },
        {
            element: "[data-tour='hr-upload-file-area']",
            popover: {
                title: "Select Your File",
                description:
                    "Drag and drop a file here, or click to browse. Supported formats include PDF, Word, Excel, and images. Files are automatically scanned for security.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='hr-upload-category']",
            popover: {
                title: "Choose a Category",
                description:
                    "Select a category to organize the document (e.g., Policies, Forms, Handbooks). This helps employees find documents more easily.",
                side: "top",
            },
        },
        {
            element: "[data-tour='hr-upload-visibility']",
            popover: {
                title: "Set Visibility",
                description:
                    "Toggle Public Access to make the document visible to all users. Private documents are only accessible to users with specific permissions.",
                side: "top",
            },
        },
        {
            popover: {
                title: "Tour Complete! ✅",
                description:
                    "You now know how to upload HR documents. After uploading, the document appears in the HR Resources library for employees to browse and download.",
            },
        },
    ],
};
