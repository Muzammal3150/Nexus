'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError() {
    return (
        <html>
            <body>
                <main className="flex min-h-screen items-center justify-center bg-background px-6">
                    <div className="w-full max-w-md text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>

                        <p className="mt-3 text-muted-foreground">
                            An unexpected error occurred. Please try again or return to the
                            homepage.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button onClick={() => window.location.reload()} className="gap-2">
                                <RefreshCcw className="h-4 w-4" />
                                Try again
                            </Button>

                            <Link href="/">
                                <Button variant="outline" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Go home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
