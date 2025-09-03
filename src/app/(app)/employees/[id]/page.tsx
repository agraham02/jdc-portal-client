interface Params {
    id: string;
}
export default function Page({ params }: { params: Params }) {
    return (
        <main>
            <h1>Employee Details</h1>
            <p>ID: {params.id}</p>
        </main>
    );
}
