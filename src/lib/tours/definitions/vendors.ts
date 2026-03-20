import type { TourDefinition } from "../types";

export const vendorsTour: TourDefinition = {
    id: "vendors",
    title: "Vendor Management",
    description:
        "Learn how to view vendor profiles and manage the vendor approval workflow.",
    roles: ["Admin", "External Affairs", "Management"],
    startPath: "/vendors",
    steps: [
        {
            popover: {
                title: "Vendor Management 🏢",
                description:
                    "This tour covers the vendor management system — viewing vendor profiles and processing approvals.",
            },
        },
        {
            element: "[data-tour='nav-vendors']",
            popover: {
                title: "Vendors Page",
                description:
                    "Access the vendor directory from the People section in the sidebar.",
                side: "right",
            },
        },
        {
            element: "[data-tour='vendors-list']",
            popover: {
                title: "Vendor Directory",
                description:
                    "All registered vendors appear here with their company name, status, and key information. Pending vendors need your approval before they can apply for contracts.",
                side: "top",
            },
        },
        {
            popover: {
                title: "Approval Workflow",
                description:
                    "Vendors self-register through the portal. You review their information and either approve or reject their registration. Approved vendors can then apply for open contracts.",
            },
        },
        {
            popover: {
                title: "Tour Complete! ✅",
                description:
                    "You now know the vendor management basics. Check Help & Guides for detailed step-by-step approval instructions.",
            },
        },
    ],
};
