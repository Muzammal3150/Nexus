export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="grid place-items-center min-h-svh bg-background p-6 md:p-10">
            {children}
        </main>
    );
}
