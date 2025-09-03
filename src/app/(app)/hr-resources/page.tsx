import Link from "next/link";

export default function HRResourcesPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">HR Resources</h1>
            <div className="flex gap-3">
                <Link
                    className="text-blue-600 hover:underline"
                    href="/hr-resources/upload"
                >
                    Upload Document
                </Link>
                <Link
                    className="text-blue-600 hover:underline"
                    href="/hr-resources/library"
                >
                    View Library
                </Link>
            </div>
            <p className="text-muted-foreground">
                HR document library and management will appear here.
            </p>
        </main>
    );
}
