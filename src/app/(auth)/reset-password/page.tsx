"use client";

export default function Page({
    searchParams,
}: {
    searchParams?: { token?: string };
}) {
    const token = searchParams?.token;
    return (
        <main>
            <h1>Reset Password</h1>
            <p>
                {token
                    ? "Validating your reset link…"
                    : "Missing token. Please use the link from your email."}
            </p>
        </main>
    );
}
