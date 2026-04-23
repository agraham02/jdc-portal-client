import type { TourDefinition } from "../types";

export const createContractTour: TourDefinition = {
    id: "create-contract",
    title: "Create a Contract",
    description:
        "Step-by-step walkthrough of creating a new contract opportunity for vendors.",
    roles: ["Admin", "External Affairs"],
    startPath: "/contracts/new",
    stepMeta: {
        2: { navigateTo: "/contracts/new" },
        3: { navigateTo: "/contracts/new" },
        4: { navigateTo: "/contracts/new" },
        5: { navigateTo: "/contracts/new" },
    },
    steps: [
        {
            popover: {
                title: "Create a New Contract 📝",
                description:
                    "This tour walks you through creating a contract opportunity that vendors can apply to.",
            },
        },
        {
            element: "[data-tour='create-contract-header']",
            popover: {
                title: "Contract Creation Page",
                description:
                    "This is where you build your contract. Fill in the details section by section — start with the basics, then add requirements and documents.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='contract-basic-info']",
            popover: {
                title: "Basic Information",
                description:
                    "Enter the contract title, a detailed description of the work, budget (optional), currency, and application deadline. Title and description are required.",
                side: "top",
            },
        },
        {
            element: "[data-tour='contract-required-docs']",
            popover: {
                title: "Required Documents",
                description:
                    "Specify what documents vendors must submit with their application (e.g., Business License, Portfolio). Click 'Add Document' to add requirements. You can mark each as required or optional.",
                side: "top",
            },
        },
        {
            element: "[data-tour='contract-supporting-docs']",
            popover: {
                title: "Supporting Documents",
                description:
                    "Upload any files that help vendors understand the opportunity — scope of work, specifications, terms and conditions. Files are scanned for security automatically.",
                side: "top",
            },
        },
        {
            element: "[data-tour='contract-form-actions']",
            popover: {
                title: "Submit the Contract",
                description:
                    "Click 'Create Contract' to save. The contract starts as a Draft — you can review it before publishing to vendors.",
                side: "top",
            },
        },
        {
            popover: {
                title: "After Creation",
                description:
                    "Your contract starts in Draft status. When ready, publish it to Open status so vendors can apply. You can edit it anytime while it's still a Draft.",
            },
        },
        {
            popover: {
                title: "Tour Complete! ✅",
                description:
                    "You now know how to create contracts. Check Help & Guides for details on managing the full contract lifecycle and reviewing applications.",
            },
        },
    ],
};
