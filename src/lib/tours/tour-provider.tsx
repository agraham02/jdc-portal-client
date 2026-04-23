"use client";

import {
    createContext,
    useContext,
    useCallback,
    useState,
    useRef,
    type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { driver, type Config, type Driver } from "driver.js";
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

/** Delay used when navigating to a new route with no specific element to wait for. */
const DEFAULT_NAVIGATION_DELAY_MS = 800;

/**
 * Wait for a DOM element matching `selector` to appear.
 * Resolves with the element once found, or `null` if `timeoutMs` elapses
 * before the element is present in the DOM.
 */
function waitForElement(
    selector: string,
    timeoutMs = 3000,
): Promise<Element | null> {
    return new Promise((resolve) => {
        const existing = document.querySelector(selector);
        if (existing) {
            resolve(existing);
            return;
        }

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeoutMs);
    });
}

export function TourProvider({ children }: { children: ReactNode }) {
    const [isRunning, setIsRunning] = useState(false);
    const [activeTourId, setActiveTourId] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);
    pathnameRef.current = pathname;

    const startTour = useCallback(
        async (tourId: string) => {
            const tour = tourRegistry[tourId];
            if (!tour) return;

            setIsRunning(true);
            setActiveTourId(tourId);

            // Navigate to startPath if we're not already there
            if (tour.startPath && pathnameRef.current !== tour.startPath) {
                router.push(tour.startPath);
                // Wait for the first page-specific element to render
                const firstElementStep = tour.steps.find((s) => s.element);
                if (firstElementStep?.element) {
                    await waitForElement(
                        firstElementStep.element as string,
                        4000,
                    );
                } else {
                    // Fallback: short delay for navigation to settle
                    await new Promise((r) =>
                        setTimeout(r, DEFAULT_NAVIGATION_DELAY_MS),
                    );
                }
            }

            const cleanup = () => {
                markTourCompleted(tourId);
                setIsRunning(false);
                setActiveTourId(null);
            };

            /** Navigate to a path and wait for a target element */
            const navigateAndWait = async (
                targetPath: string,
                elementSelector?: string,
            ): Promise<void> => {
                if (pathnameRef.current !== targetPath) {
                    router.push(targetPath);
                }
                if (elementSelector) {
                    await waitForElement(elementSelector, 4000);
                } else {
                    await new Promise((r) =>
                        setTimeout(r, DEFAULT_NAVIGATION_DELAY_MS),
                    );
                }
            };

            const driverConfig: Config = {
                animate: true,
                showProgress: true,
                showButtons: ["next", "previous", "close"],
                steps: tour.steps,
                allowClose: true,
                // Prevent accidental dismissal by clicking the overlay
                overlayClickBehavior: "nextStep",
                onDestroyed: cleanup,
                // Handle step-level navigation for steps that need a different page
                onHighlightStarted: (_element, step, opts) => {
                    const activeIdx = opts.state.activeIndex;
                    if (activeIdx === undefined) return;

                    const stepDef = tour.steps[activeIdx];
                    // If the element doesn't exist in DOM, skip forward
                    if (
                        stepDef?.element &&
                        !document.querySelector(stepDef.element as string)
                    ) {
                        // Auto-skip missing-element steps after the current driver
                        // callback completes, without deferring a full event-loop tick.
                        queueMicrotask(() => driverInstance.moveNext());
                    }
                },
                onNextClick: (_element, _step, opts) => {
                    const currentIdx = opts.state.activeIndex ?? 0;
                    const nextIdx = currentIdx + 1;

                    if (nextIdx >= (tour.steps.length ?? 0)) {
                        driverInstance.destroy();
                        return;
                    }

                    const nextStepMeta = tour.stepMeta?.[nextIdx];
                    const nextStep = tour.steps[nextIdx];

                    if (nextStepMeta?.navigateTo && nextStep?.element) {
                        // Need to navigate before advancing
                        navigateAndWait(
                            nextStepMeta.navigateTo,
                            nextStep.element as string,
                        ).then(() => {
                            driverInstance.moveNext();
                        });
                    } else {
                        driverInstance.moveNext();
                    }
                },
                onPrevClick: (_element, _step, opts) => {
                    const currentIdx = opts.state.activeIndex ?? 0;
                    const prevIdx = currentIdx - 1;

                    if (prevIdx < 0) return;

                    const prevStepMeta = tour.stepMeta?.[prevIdx];
                    const prevStep = tour.steps[prevIdx];

                    if (prevStepMeta?.navigateTo && prevStep?.element) {
                        navigateAndWait(
                            prevStepMeta.navigateTo,
                            prevStep.element as string,
                        ).then(() => {
                            driverInstance.movePrevious();
                        });
                    } else {
                        driverInstance.movePrevious();
                    }
                },
                popoverClass: "jdc-tour-popover",
                stagePadding: 8,
                stageRadius: 8,
            };

            const driverInstance: Driver = driver(driverConfig);
            driverInstance.drive();
        },
        [router],
    );

    const getTourDefinition = useCallback((tourId: string) => {
        return tourRegistry[tourId];
    }, []);

    const getAllTours = useCallback((): TourDefinition[] => {
        return Object.values(tourRegistry);
    }, []);

    const getToursForRole = useCallback(
        (roleName: string): TourDefinition[] => {
            return Object.values(tourRegistry).filter(
                (tour) =>
                    tour.roles.length === 0 ||
                    tour.roles.some(
                        (r) => r.toLowerCase() === roleName.toLowerCase(),
                    ),
            );
        },
        [],
    );

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
