import { cn } from "@/lib/utils";

export function LoadingPage() {
    return (
        <main className="flex min-h-screen items-center justify-center">
            <Loading />
        </main>
    );
}

export function Loading({ className }: { className?: string }) {
    return (
        <div className={(cn("flex flex-col items-center gap-4",className))}>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

            <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
    );
}
