import type { DriveStep } from "driver.js";

export interface TourDefinition {
    id: string;
    title: string;
    description: string;
    /** Which roles this tour is relevant to. Empty = all roles */
    roles: string[];
    /** The page where this tour should start */
    startPath?: string;
    steps: DriveStep[];
}
