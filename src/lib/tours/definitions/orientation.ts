import type { TourDefinition } from "../types";

export const orientationTour: TourDefinition = {
    id: "orientation",
    title: "Portal Orientation",
    description:
        "A quick tour of the JDC Portal — learn where everything is and how to navigate the app.",
    roles: [],
    startPath: "/dashboard",
    steps: [
        {
            popover: {
                title: "Welcome to the JDC Portal! 👋",
                description:
                    "Let's take a quick tour to help you find your way around. This will only take a minute.",
            },
        },
        {
            element: "[data-tour='sidebar']",
            popover: {
                title: "Sidebar Navigation",
                description:
                    "The sidebar is your main navigation tool. It's organized into sections based on your role — you'll only see pages you have access to.",
                side: "right",
                align: "start",
            },
        },
        {
            element: "[data-tour='sidebar-trigger']",
            popover: {
                title: "Toggle Sidebar",
                description:
                    "Click this button to collapse or expand the sidebar. On mobile, it opens as an overlay.",
                side: "right",
            },
        },
        {
            element: "[data-tour='header-logo']",
            popover: {
                title: "JDC Portal",
                description:
                    "You're using the JDC Portal — your central hub for managing employees, vendors, contracts, and HR resources.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='notifications']",
            popover: {
                title: "Notifications",
                description:
                    "Click the bell icon to check your notification inbox. You'll receive updates about important events relevant to your role.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='theme-toggle']",
            popover: {
                title: "Dark Mode",
                description:
                    "Toggle between light and dark mode using this button. Your preference is saved automatically.",
                side: "bottom",
            },
        },
        {
            element: "[data-tour='nav-dashboard']",
            popover: {
                title: "Your Dashboard",
                description:
                    "The Dashboard is your home page with a summary of key information tailored to your role.",
                side: "right",
            },
        },
        {
            element: "[data-tour='nav-help']",
            popover: {
                title: "Help & Guides",
                description:
                    "Find step-by-step guides organized by role, or launch interactive tours to learn features hands-on.",
                side: "right",
            },
        },
        {
            popover: {
                title: "You're All Set! 🎉",
                description:
                    "That's the basics! Explore the Help & Guides section for detailed instructions on specific features. You can always retake this tour from there.",
            },
        },
    ],
};
