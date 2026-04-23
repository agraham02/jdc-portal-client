import { ReactNode } from "react";

interface StepListProps {
    children: ReactNode;
}

export function StepList({ children }: StepListProps) {
    return (
        <div className="my-6 space-y-4" role="list">
            {children}
        </div>
    );
}

interface StepProps {
    number: number;
    title: string;
    children: ReactNode;
}

export function Step({ number, title, children }: StepProps) {
    return (
        <div className="flex gap-4" role="listitem">
            <div className="flex-shrink-0 flex items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {number}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base mb-1">{title}</h4>
                <div className="text-muted-foreground text-sm leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
