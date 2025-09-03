import Link from "next/link";

export default function ContractDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">Contract Details</h1>
            <p className="text-muted-foreground">ID: {id}</p>
            <div className="flex gap-3">
                <Link
                    className="text-blue-600 hover:underline"
                    href={`/contracts/${id}/edit`}
                >
                    Edit Contract
                </Link>
                <Link
                    className="text-blue-600 hover:underline"
                    href="/contracts"
                >
                    Back to Contracts
                </Link>
            </div>
        </main>
    );
}
