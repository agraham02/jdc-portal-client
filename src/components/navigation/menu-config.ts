import {
    Bell,
    Building2,
    FileText,
    Home,
    LayoutDashboard,
    Settings,
    Shield,
    ShieldCheck,
    User,
    Users,
} from "lucide-react";
import type { MenuItem } from "./types";

export const menu = {
    application: [
        { title: "Home", url: "/", icon: Home },
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Notifications", url: "/notifications", icon: Bell },
    ] satisfies MenuItem[],

    procurement: [
        { title: "Contracts", url: "/contracts", icon: FileText },
        {
            title: "My Applications",
            url: "/contracts/my-applications",
            icon: FileText,
        },
        { title: "HR Resources", url: "/hr-resources", icon: FileText },
    ] satisfies MenuItem[],

    people: [
        { title: "Employees", url: "/employees", icon: Users },
        { title: "Vendors", url: "/vendors", icon: Building2 },
    ] satisfies MenuItem[],

    admin: [
        {
            title: "Admin Dashboard",
            url: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        { title: "RBAC", url: "/admin/rbac", icon: Shield },
        { title: "Roles", url: "/admin/rbac/roles", icon: ShieldCheck },
        {
            title: "Permissions",
            url: "/admin/rbac/permissions",
            icon: ShieldCheck,
        },
        { title: "Users", url: "/admin/rbac/users", icon: Users },
    ] satisfies MenuItem[],

    account: [
        { title: "Profile", url: "/profile", icon: User },
        { title: "Security", url: "/profile/security", icon: Shield },
        {
            title: "Notification Prefs",
            url: "/profile/notifications",
            icon: Bell,
        },
        { title: "Sessions", url: "/profile/sessions", icon: User },
        { title: "Settings", url: "/settings", icon: Settings },
    ] satisfies MenuItem[],
} as const;

export type MenuGroups = keyof typeof menu;
