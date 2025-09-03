interface Params {
    id: string;
}
export default function Page({ params }: { params: Params }) {
    return (
        <main>
            <h1>Vendor Details</h1>
            <p>ID: {params.id}</p>
        </main>
    );
}
