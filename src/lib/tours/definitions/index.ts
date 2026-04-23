import type { TourDefinition } from "../types";
import { orientationTour } from "./orientation";
import { contractsTour } from "./contracts";
import { employeesTour } from "./employees";
import { vendorsTour } from "./vendors";
import { hrResourcesTour } from "./hr-resources";
import { notificationsTour } from "./notifications";
import { inviteEmployeeTour } from "./invite-employee";
import { createContractTour } from "./create-contract";
import { uploadHrDocumentTour } from "./upload-hr-document";

export const tourRegistry: Record<string, TourDefinition> = {
    [orientationTour.id]: orientationTour,
    [contractsTour.id]: contractsTour,
    [employeesTour.id]: employeesTour,
    [vendorsTour.id]: vendorsTour,
    [hrResourcesTour.id]: hrResourcesTour,
    [notificationsTour.id]: notificationsTour,
    [inviteEmployeeTour.id]: inviteEmployeeTour,
    [createContractTour.id]: createContractTour,
    [uploadHrDocumentTour.id]: uploadHrDocumentTour,
};

export const allTours: TourDefinition[] = Object.values(tourRegistry);
