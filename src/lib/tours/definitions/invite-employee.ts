import type { TourDefinition } from "../types";

export const inviteEmployeeTour: TourDefinition = {
    id: "invite-employee",
    title: "Invite an Employee",
    description:
        "Step-by-step walkthrough of inviting a new employee to the JDC Portal.",
    roles: ["Admin", "Management", "HR"],
    startPath: "/employees/new",
    stepMeta: {
        2: { navigateTo: "/employees/new" },
        3: { navigateTo: "/employees/new" },
    },
    steps: [
        {
            popover: {
                title: "Invite a New Employee ✉️",
                description:
                    "This tour walks you through inviting a new employee. They'll receive an activation email to set up their account.",
            },
        },
        {
            element: "[data-tour='invite-employee-header']",
            popover: {
                title: "Invitation Page",
                description:
                    "This is the employee invitation page. You'll enter the new employee's email and optional HR details.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='invite-employee-form']",
            popover: {
                title: "Invitation Form",
                description:
                    "The form has two sections: the required email field, and optional HR information like Employee ID, Job Title, Department, and Hire Date. Fill in the email to send the invitation.",
                side: "top",
            },
        },
        {
            popover: {
                title: "What Happens Next?",
                description:
                    "After clicking 'Send Invitation', the employee receives an activation email. They'll use it to set their password and complete their profile during onboarding.",
            },
        },
        {
            popover: {
                title: "Tour Complete! ✅",
                description:
                    "You now know how to invite employees. Check Help & Guides for more details on the full employee lifecycle.",
            },
        },
    ],
};
