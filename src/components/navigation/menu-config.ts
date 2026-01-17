import {
    Activity,
    Bell,
    Bug,
    Building2,
    Database,
    FileText,
    FolderKanban,
    HardDrive,
    LayoutDashboard,
    Mail,
    Settings,
    Shield,
    User,
    Users,
} from "lucide-react";
import type { MenuItem } from "./types";
import { PermissionName as P } from "@/lib/constants/permission-names";

export const menu = {
    application: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Notifications", url: "/notifications", icon: Bell },
    ] satisfies MenuItem[],

    procurement: [
        {
            title: "Contracts",
            url: "/contracts",
            icon: FileText,
            anyOf: [P.CONTRACT_READ, P.CONTRACT_READ_ALL],
        },
        {
            title: "My Applications",
            url: "/contracts/my-applications",
            icon: FileText,
            anyOf: [P.CONTRACT_APPLY],
        },
    ] satisfies MenuItem[],

    resources: [
        {
            title: "HR Resources",
            url: "/hr-resources",
            icon: FileText,
            // No permission required - public resources visible to all authenticated users
        },
        {
            title: "HR Categories",
            url: "/admin/hr-categories",
            icon: FolderKanban,
            anyOf: [P.HR_DOCUMENT_CREATE, P.HR_DOCUMENT_UPDATE],
        },
    ] satisfies MenuItem[],

    people: [
        {
            title: "Employees",
            url: "/employees",
            icon: Users,
            anyOf: [P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL],
        },
        {
            title: "Vendors",
            url: "/vendors",
            icon: Building2,
            anyOf: [P.VENDOR_READ_ALL],
        },
    ] satisfies MenuItem[],

    userManagement: [
        {
            title: "Users",
            url: "/users",
            icon: Users,
            anyOf: [P.USER_READ_ALL, P.RBAC_USER_ASSIGN_ROLES],
        },
        {
            title: "Roles",
            url: "/users/roles",
            icon: Shield,
            anyOf: [
                P.RBAC_ROLE_READ,
                P.RBAC_ROLE_MANAGE,
                P.RBAC_PERMISSION_READ,
            ],
        },
    ] satisfies MenuItem[],

    adminControlPanel: [
        {
            title: "Overview",
            url: "/admin/control-panel",
            icon: LayoutDashboard,
            anyOf: [P.SYSTEM_ADMIN],
        },
        {
            title: "Observability",
            url: "/admin/control-panel/observability",
            icon: Activity,
            anyOf: [P.ADMIN_OBSERVABILITY_READ],
        },
        {
            title: "Storage Manager",
            url: "/admin/control-panel/storage",
            icon: HardDrive,
            anyOf: [P.ADMIN_STORAGE_READ],
        },
        {
            title: "Database Sandbox",
            url: "/admin/control-panel/database",
            icon: Database,
            anyOf: [P.ADMIN_DATABASE_READ],
        },
        {
            title: "Mail Testing",
            url: "/admin/control-panel/mail",
            icon: Mail,
            anyOf: [P.ADMIN_MAIL_TEST],
        },
        {
            title: "Debug Console",
            url: "/admin/control-panel/debug",
            icon: Bug,
            anyOf: [P.ADMIN_DEBUG],
        },
    ] satisfies MenuItem[],

    account: [
        { title: "Profile", url: "/profile", icon: User },
        { title: "Settings", url: "/settings", icon: Settings },
    ] satisfies MenuItem[],
} as const;

export type MenuGroups = keyof typeof menu;
