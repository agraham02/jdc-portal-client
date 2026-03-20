import type { MDXComponents } from "mdx/types";
import { Callout } from "./Callout";
import { StepList, Step } from "./StepList";
import { RoleTag } from "./RoleTag";
import { KeyboardShortcut } from "./KeyboardShortcut";

export function getMDXComponents(): MDXComponents {
    return {
        // Custom components available in MDX files
        Callout,
        StepList,
        Step,
        RoleTag,
        KeyboardShortcut,

        // Override default HTML elements for consistent styling
        h1: (props) => (
            <h1
                className="text-3xl font-bold tracking-tight mt-8 mb-4 first:mt-0"
                {...props}
            />
        ),
        h2: (props) => (
            <h2
                className="text-2xl font-semibold tracking-tight mt-8 mb-3 border-b pb-2"
                {...props}
            />
        ),
        h3: (props) => (
            <h3
                className="text-xl font-semibold tracking-tight mt-6 mb-2"
                {...props}
            />
        ),
        h4: (props) => (
            <h4
                className="text-lg font-semibold tracking-tight mt-4 mb-2"
                {...props}
            />
        ),
        p: (props) => (
            <p
                className="leading-7 text-muted-foreground [&:not(:first-child)]:mt-4"
                {...props}
            />
        ),
        ul: (props) => (
            <ul className="my-4 ml-6 list-disc space-y-2 text-muted-foreground" {...props} />
        ),
        ol: (props) => (
            <ol className="my-4 ml-6 list-decimal space-y-2 text-muted-foreground" {...props} />
        ),
        li: (props) => <li className="leading-7" {...props} />,
        blockquote: (props) => (
            <blockquote
                className="mt-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
                {...props}
            />
        ),
        code: (props) => (
            <code
                className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                {...props}
            />
        ),
        pre: (props) => (
            <pre
                className="my-4 overflow-x-auto rounded-lg border bg-muted p-4"
                {...props}
            />
        ),
        table: (props) => (
            <div className="my-4 w-full overflow-auto">
                <table className="w-full border-collapse" {...props} />
            </div>
        ),
        th: (props) => (
            <th
                className="border px-4 py-2 text-left font-bold bg-muted"
                {...props}
            />
        ),
        td: (props) => (
            <td className="border px-4 py-2 text-left" {...props} />
        ),
        hr: () => <hr className="my-8 border-t" />,
        a: (props) => (
            <a
                className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                {...props}
            />
        ),
        img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                className="my-4 rounded-lg border shadow-sm max-w-full"
                alt={props.alt || ""}
                {...props}
            />
        ),
    };
}
