import type { TourDefinition } from "../types";

export const contractsTour: TourDefinition = {
    id: "contracts",
    title: "Contracts Management",
    description:
        "Learn how to create, manage, and review contracts in the procurement system.",
    roles: ["Admin", "External Affairs"],
    startPath: "/contracts",
    stepMeta: {
        2: { navigateTo: "/contracts" },
        3: { navigateTo: "/contracts" },
    },
    steps: [
        {
            popover: {
                title: "Contracts Management 📋",
                description:
                    "This tour walks you through the contracts system — from creating contracts to reviewing vendor applications.",
            },
        },
        {
            element: "[data-tour='nav-contracts']",
            popover: {
                title: "Contracts Page",
                description:
                    "Access your contracts list from the Procurement section in the sidebar.",
                side: "right",
            },
        },
        {
            element: "[data-tour='contracts-list']",
            popover: {
                title: "Contracts List",
                description:
                    "Here you'll see all contracts with their status, title, and key dates. Use filters to narrow down by status (Draft, Open, Closed, Awarded).",
                side: "top",
            },
        },
        {
            element: "[data-tour='create-contract']",
            popover: {
                title: "Create New Contract",
                description:
                    "Click here to create a new contract. You'll fill in the title, description, requirements, and attach any supporting documents.",
                side: "left",
            },
        },
        {
            popover: {
                title: "Contract Lifecycle",
                description:
                    "Contracts flow through stages: Draft → Open → Closed → Awarded. Start with Draft, publish when ready, close applications, then award to the best vendor.",
            },
        },
        {
            popover: {
                title: "Tour Complete! ✅",
                description:
                    "You now know the basics of contract management. Check the Help & Guides section for detailed step-by-step instructions.",
            },
        },
    ],
};
