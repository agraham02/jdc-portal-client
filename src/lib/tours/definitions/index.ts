import type { TourDefinition } from "../types";
import { orientationTour } from "./orientation";
import { contractsTour } from "./contracts";
import { employeesTour } from "./employees";
import { vendorsTour } from "./vendors";
import { hrResourcesTour } from "./hr-resources";
import { notificationsTour } from "./notifications";

export const tourRegistry: Record<string, TourDefinition> = {
    [orientationTour.id]: orientationTour,
    [contractsTour.id]: contractsTour,
    [employeesTour.id]: employeesTour,
    [vendorsTour.id]: vendorsTour,
    [hrResourcesTour.id]: hrResourcesTour,
    [notificationsTour.id]: notificationsTour,
};

export const allTours: TourDefinition[] = Object.values(tourRegistry);
