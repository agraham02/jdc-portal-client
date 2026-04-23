"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, BookOpen, Map, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useTour } from "@/lib/tours/tour-provider";

export function HelpFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { startTour } = useTour();

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="mb-2 flex flex-col gap-2 rounded-lg border bg-popover p-3 shadow-lg"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start gap-2"
                            onClick={() => {
                                setIsOpen(false);
                                startTour("orientation");
                            }}
                        >
                            <Map className="h-4 w-4" />
                            Take a Tour
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start gap-2"
                            onClick={() => {
                                setIsOpen(false);
                                router.push("/help");
                            }}
                        >
                            <BookOpen className="h-4 w-4" />
                            View Guides
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close help menu" : "Open help menu"}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isOpen ? (
                        <motion.span
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="h-5 w-5" />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="help"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <HelpCircle className="h-5 w-5" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </Button>
        </div>
    );
}
