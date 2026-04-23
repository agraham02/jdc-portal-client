import type { DriveStep } from "driver.js";

/** Extra metadata for a tour step (keyed by step index) */
export interface TourStepMeta {
    /** Navigate to this path before highlighting this step's element */
    navigateTo?: string;
}

export interface TourDefinition {
    id: string;
    title: string;
    description: string;
    /** Which roles this tour is relevant to. Empty = all roles */
    roles: string[];
    /** The page where this tour should start */
    startPath?: string;
    steps: DriveStep[];
    /** Per-step metadata, keyed by step index */
    stepMeta?: Record<number, TourStepMeta>;
}
