export default function ContractEditPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">Edit Contract</h1>
            <p className="text-muted-foreground">
                Editing contract ID: {params.id}
            </p>
        </main>
    );
}
