import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Guide, GuideFrontmatter, GuideMetadata, GuideRole } from "./types";

const GUIDES_DIR = path.join(process.cwd(), "src", "content", "guides");

function getGuideFiles(role: string): string[] {
    const dir = path.join(GUIDES_DIR, role);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

function parseGuideFile(role: string, filename: string): Guide {
    const filePath = path.join(GUIDES_DIR, role, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = data as GuideFrontmatter;
    const slug = `${role}/${filename.replace(/\.mdx$/, "")}`;

    return {
        ...frontmatter,
        slug,
        content,
    };
}

export function getAllGuides(): GuideMetadata[] {
    const roles: GuideRole[] = [
        "shared",
        "admin",
        "management",
        "hr",
        "external-affairs",
        "employee",
    ];

    const guides: GuideMetadata[] = [];

    for (const role of roles) {
        const files = getGuideFiles(role);
        for (const file of files) {
            const guide = parseGuideFile(role, file);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { content: _, ...metadata } = guide;
            guides.push(metadata);
        }
    }

    return guides.sort((a, b) => {
        if (a.role === b.role) return a.order - b.order;
        return roles.indexOf(a.role) - roles.indexOf(b.role);
    });
}

export function getGuidesByRole(role: GuideRole): GuideMetadata[] {
    return getAllGuides().filter((g) => g.role === role);
}

export function getGuideBySlug(slug: string): Guide | null {
    const [role, filename] = slug.split("/");
    const filePath = path.join(GUIDES_DIR, role, `${filename}.mdx`);
    if (!fs.existsSync(filePath)) return null;
    return parseGuideFile(role, `${filename}.mdx`);
}

export function getAdjacentGuides(
    slug: string
): { prev: GuideMetadata | null; next: GuideMetadata | null } {
    const guide = getGuideBySlug(slug);
    if (!guide) return { prev: null, next: null };

    const roleGuides = getGuidesByRole(guide.role);
    const index = roleGuides.findIndex((g) => g.slug === slug);

    return {
        prev: index > 0 ? roleGuides[index - 1] : null,
        next: index < roleGuides.length - 1 ? roleGuides[index + 1] : null,
    };
}
