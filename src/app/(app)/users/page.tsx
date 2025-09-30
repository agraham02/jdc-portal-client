import { UsersTable } from "@/components/users/UsersTable";

export default function UsersPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Users</h1>
            </div>
            <UsersTable />
        </div>
    );
}
