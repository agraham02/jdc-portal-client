export type GuideRole =
    | "admin"
    | "management"
    | "hr"
    | "external-affairs"
    | "employee"
    | "shared";

export const GUIDE_ROLE_LABELS: Record<GuideRole, string> = {
    admin: "Admin",
    management: "Management",
    hr: "HR",
    "external-affairs": "External Affairs",
    employee: "Employee",
    shared: "General",
};

export const GUIDE_ROLE_COLORS: Record<GuideRole, string> = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    management:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    hr: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "external-affairs":
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    employee:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    shared: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export interface GuideFrontmatter {
    title: string;
    description: string;
    role: GuideRole;
    order: number;
    tags?: string[];
    estimatedMinutes?: number;
}

export interface GuideMetadata extends GuideFrontmatter {
    slug: string;
}

export interface Guide extends GuideMetadata {
    content: string;
}
