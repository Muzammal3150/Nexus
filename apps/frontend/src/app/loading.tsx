export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

        <p className="text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    </main>
  );
}