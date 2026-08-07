'use client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useUiStore } from '@/stores/uiStore';
import { ChevronLeft, PhoneCall } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
    const open = useUiStore((s) => s.open);
    return (
        <main className="grid m-auto min-h-screen w-sm place-items-center p-6">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle>Call Not Found</CardTitle>
                    <CardDescription></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        The call ID you entered could not be found. Please verify the URL or try
                        again.
                    </p>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2">
                    <Link href="/calls">
                        <Button variant={'outline'} className={'w-full'} size={'lg'}>
                            <ChevronLeft />
                            Back to calls
                        </Button>
                    </Link>
                    <Button size={'lg'} onClick={() => open('new-call-dialog')}>
                        <PhoneCall />
                        New Call
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
