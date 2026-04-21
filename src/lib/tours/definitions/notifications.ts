import type { TourDefinition } from "../types";

export const notificationsTour: TourDefinition = {
    id: "notifications",
    title: "Notifications",
    description: "Learn how to manage your notification inbox and preferences.",
    roles: [],
    startPath: "/notifications",
    steps: [
        {
            popover: {
                title: "Notifications 🔔",
                description:
                    "This tour shows you how to manage your notifications — staying informed about important portal events.",
            },
        },
        {
            element: "[data-tour='notifications']",
            popover: {
                title: "Notification Bell",
                description:
                    "Click the bell icon to open your notification inbox. Unread notifications will show a badge with the count.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='nav-notifications']",
            popover: {
                title: "Full Notifications Page",
                description:
                    "For a complete view with search and filtering, visit the full Notifications page from the sidebar.",
                side: "right",
            },
        },
        {
            element: "[data-tour='nav-settings']",
            popover: {
                title: "Notification Preferences",
                description:
                    "Go to Settings to configure which notifications you receive and how they're delivered (in-app, email, etc.).",
                side: "right",
            },
        },
        {
            popover: {
                title: "Tour Complete! ✅",
                description:
                    "You're all set with notifications. Configure your preferences in Settings to control what you receive.",
            },
        },
    ],
};
