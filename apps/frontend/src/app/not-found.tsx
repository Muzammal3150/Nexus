import Link from 'next/link';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function NotFound() {
    return (
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
            <Card className="w-full max-w-md border-border/60 shadow-sm">
                <CardHeader className="items-center text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
                        <SearchX className="size-8 text-muted-foreground" />
                    </div>

                    <p className="text-sm font-medium text-muted-foreground">Error 404</p>

                    <CardTitle className="mt-2 text-3xl tracking-tight">Page not found</CardTitle>

                    <CardDescription className="max-w-sm text-base leading-relaxed">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have
                        been moved or no longer exists.
                    </CardDescription>
                </CardHeader>

                <CardContent />

                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto">
                            <Home className="mr-2 size-4" />
                            Back to home
                        </Button>
                    </Link>

                    <Link href="javascript:history.back()">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <ArrowLeft className="mr-2 size-4" />
                            Go back
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </main>
    );
}
