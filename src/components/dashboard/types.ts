/**
 * Dashboard card component types and interfaces
 */

import { ReactNode } from "react";

/**
 * Base props for all dashboard cards
 */
export interface BaseDashboardCardProps {
    /** Optional custom className for styling overrides */
    className?: string;
}

/**
 * Stats card data structure
 */
export interface StatsCardData {
    label: string;
    value: number | string;
    trend?: {
        direction: "up" | "down" | "neutral";
        value: string;
    };
    icon?: ReactNode;
}

/**
 * Pending approval item structure
 */
export interface PendingApprovalItem {
    id: string;
    type: "user" | "vendor";
    name: string;
    email: string;
    submittedAt: string;
    approvalUrl: string;
}

/**
 * Application status summary
 */
export interface ApplicationStatusSummary {
    total: number;
    submitted: number;
    inReview: number;
    awarded: number;
    rejected: number;
}

/**
 * Contract listing for vendors
 */
export interface OpenContractListing {
    id: string;
    title: string;
    budget?: number;
    deadline: string;
    status: string;
    detailsUrl: string;
}

/**
 * Quick link item
 */
export interface QuickLinkItem {
    label: string;
    href: string;
    icon?: ReactNode;
    description?: string;
}
