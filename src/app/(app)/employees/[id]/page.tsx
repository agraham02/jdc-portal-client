interface Params {
    id: string;
}
export default function EmployeeDetailsPage({ params }: { params: Params }) {
    return (
        <main>
            <h1>Employee Details</h1>
            <p>ID: {params.id}</p>
        </main>
    );
}
