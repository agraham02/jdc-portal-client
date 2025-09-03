import Link from "next/link";

export default function NotificationsPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <div className="flex gap-3">
                <Link
                    className="text-blue-600 hover:underline"
                    href="/notifications/inbox"
                >
                    Inbox
                </Link>
                <Link
                    className="text-blue-600 hover:underline"
                    href="/notifications/broadcasts"
                >
                    Broadcasts
                </Link>
            </div>
            <p className="text-muted-foreground">
                Notifications and preferences will appear here.
            </p>
        </main>
    );
}
