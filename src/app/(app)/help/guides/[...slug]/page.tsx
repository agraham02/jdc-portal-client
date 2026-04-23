import { notFound } from "next/navigation";
import { getGuideBySlug, getAdjacentGuides, getAllGuides } from "@/lib/guides";
import { GuideRendererClient } from "./GuideRendererClient";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMDXComponents } from "@/components/help/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// Generate static params for all guides at build time
export function generateStaticParams() {
    const guides = getAllGuides();
    return guides.map((guide) => ({
        slug: guide.slug.split("/"),
    }));
}

interface GuidePageProps {
    params: Promise<{ slug: string[] }>;
}

export default async function GuidePage({ params }: GuidePageProps) {
    const { slug: slugParts } = await params;
    const slug = slugParts.join("/");
    const guide = getGuideBySlug(slug);

    if (!guide) notFound();

    const { prev, next } = getAdjacentGuides(slug);

    const mdxContent = (
        <MDXRemote
            source={guide.content}
            components={getMDXComponents()}
            options={{
                mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                        rehypeSlug,
                        [
                            rehypeAutolinkHeadings,
                            { behavior: "wrap" },
                        ],
                    ],
                },
            }}
        />
    );

    return (
        <GuideRendererClient
            guide={guide}
            prev={prev}
            next={next}
            mdxContent={mdxContent}
        />
    );
}
