import type { TourDefinition } from "../types";

export const employeesTour: TourDefinition = {
    id: "employees",
    title: "Employee Management",
    description:
        "Learn how to view, create, and manage employee records in the portal.",
    roles: ["Admin", "Management", "HR"],
    startPath: "/employees",
    stepMeta: {
        2: { navigateTo: "/employees" },
        3: { navigateTo: "/employees" },
    },
    steps: [
        {
            popover: {
                title: "Employee Management 👥",
                description:
                    "This tour shows you how to manage employee records — from viewing the directory to creating new employees.",
            },
        },
        {
            element: "[data-tour='nav-employees']",
            popover: {
                title: "Employees Page",
                description:
                    "Access the employee directory from the People section in the sidebar.",
                side: "right",
            },
        },
        {
            element: "[data-tour='employees-list']",
            popover: {
                title: "Employee Directory",
                description:
                    "The employee list shows all employee records with key details like name, department, and status. Use search and filters to find specific employees.",
                side: "top",
            },
        },
        {
            element: "[data-tour='create-employee']",
            popover: {
                title: "Create New Employee",
                description:
                    "Click here to create a new employee record. You'll enter their personal information, contact details, and employment information.",
                side: "left",
            },
        },
        {
            popover: {
                title: "Tour Complete! ✅",
                description:
                    "You now know the basics of employee management. Visit Help & Guides for detailed instructions on the full employee lifecycle.",
            },
        },
    ],
};
