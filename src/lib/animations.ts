import type { Transition, Variants } from "motion/react";

// Shared easing curve — smooth, not spring-y
export const ease = [0.25, 0.1, 0.25, 1] as const;
export const easeOut = [0, 0, 0.2, 1] as const;

// Base transition presets
export const transition = {
    fast: { duration: 0.15, ease } satisfies Transition,
    default: { duration: 0.25, ease } satisfies Transition,
    slow: { duration: 0.4, ease } satisfies Transition,
} as const;

// Fade in from invisible
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: transition.default },
};

// Fade + slide up
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: transition.default },
};

// Fade + slide down
export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: transition.default },
};

// Fade + scale from slightly smaller
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: transition.default },
};

// Stagger container — wraps children that each use a stagger-compatible variant
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05,
        },
    },
};

// Item inside a stagger container
export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: transition.default,
    },
};

// Page-level wrapper transition
export const pageTransition: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3, ease },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15, ease: easeOut },
    },
};

// Card hover props (use directly as motion.div props)
export const cardHover = {
    whileHover: { y: -2, transition: transition.fast },
} as const;
