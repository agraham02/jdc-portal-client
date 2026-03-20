import type { TourDefinition } from "../types";

export const hrResourcesTour: TourDefinition = {
    id: "hr-resources",
    title: "HR Resources",
    description:
        "Learn how to browse, upload, and manage HR documents and resource links.",
    roles: ["Admin", "HR", "Employee", "Management"],
    startPath: "/hr-resources",
    steps: [
        {
            popover: {
                title: "HR Resources 📚",
                description:
                    "This tour shows you how to use the HR Resources section — your central library for company documents and links.",
            },
        },
        {
            element: "[data-tour='nav-hr-resources']",
            popover: {
                title: "HR Resources Page",
                description:
                    "Access HR resources from the HR section of the sidebar.",
                side: "right",
            },
        },
        {
            element: "[data-tour='hr-stats']",
            popover: {
                title: "Resource Statistics",
                description:
                    "These cards show a summary of your HR library: total documents, recent uploads, and download counts.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='hr-documents-tab']",
            popover: {
                title: "Documents Tab",
                description:
                    "Browse company documents like policies, handbooks, and forms. You can search, filter by category, and download files.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='hr-links-tab']",
            popover: {
                title: "Links Tab",
                description:
                    "Switch to the Links tab to find external resource links like payroll systems, benefits portals, and training materials.",
                side: "bottom",
            },
        },
        {
            popover: {
                title: "Tour Complete! ✅",
                description:
                    "You now know how to navigate HR Resources. If you're an HR team member, check the guide on uploading documents and managing categories.",
            },
        },
    ],
};
