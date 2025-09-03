import React from "react";

export default function ContractDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    return <div>Contract Details Page for ID: {params.id}</div>;
}
