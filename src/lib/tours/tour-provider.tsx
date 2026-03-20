"use client";

import {
    createContext,
    useContext,
    useCallback,
    useState,
    type ReactNode,
} from "react";
import { driver, type Config } from "driver.js";
import "driver.js/dist/driver.css";
import { tourRegistry } from "./definitions";
import { markTourCompleted } from "./tour-storage";
import type { TourDefinition } from "./types";

interface TourContextValue {
    startTour: (tourId: string) => void;
    isRunning: boolean;
    activeTourId: string | null;
    getTourDefinition: (tourId: string) => TourDefinition | undefined;
    getAllTours: () => TourDefinition[];
    getToursForRole: (roleName: string) => TourDefinition[];
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
    const [isRunning, setIsRunning] = useState(false);
    const [activeTourId, setActiveTourId] = useState<string | null>(null);

    const startTour = useCallback((tourId: string) => {
        const tour = tourRegistry[tourId];
        if (!tour) return;

        setIsRunning(true);
        setActiveTourId(tourId);

        const driverConfig: Config = {
            animate: true,
            showProgress: true,
            showButtons: ["next", "previous", "close"],
            steps: tour.steps,
            onDestroyed: () => {
                markTourCompleted(tourId);
                setIsRunning(false);
                setActiveTourId(null);
            },
            popoverClass:
                "jdc-tour-popover",
            stagePadding: 8,
            stageRadius: 8,
        };

        const driverInstance = driver(driverConfig);
        driverInstance.drive();
    }, []);

    const getTourDefinition = useCallback((tourId: string) => {
        return tourRegistry[tourId];
    }, []);

    const getAllTours = useCallback((): TourDefinition[] => {
        return Object.values(tourRegistry);
    }, []);

    const getToursForRole = useCallback((roleName: string): TourDefinition[] => {
        return Object.values(tourRegistry).filter(
            (tour) =>
                tour.roles.length === 0 ||
                tour.roles.some(
                    (r) => r.toLowerCase() === roleName.toLowerCase()
                )
        );
    }, []);

    return (
        <TourContext.Provider
            value={{
                startTour,
                isRunning,
                activeTourId,
                getTourDefinition,
                getAllTours,
                getToursForRole,
            }}
        >
            {children}
        </TourContext.Provider>
    );
}

export function useTour() {
    const ctx = useContext(TourContext);
    if (!ctx) {
        throw new Error("useTour must be used inside TourProvider");
    }
    return ctx;
}
