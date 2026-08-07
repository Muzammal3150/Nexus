'use client';

import { Phone, PhoneCall } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useUiStore } from '@/stores/uiStore';

export default function AppNewCall() {
    const open = useUiStore((s) => s.open);

    return (
        <div className="flex flex-1 h-full flex-col items-center justify-center gap-3 bg-muted/20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <PhoneCall className="size-7 text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-medium">No call selected</p>
                <p className="text-sm text-muted-foreground">
                    Pick a favourite or a recent call to get started
                </p>
            </div>
            <Button onClick={() => open('new-call-dialog')}>
                <Phone className="mr-2 size-4" />
                Start a Call
            </Button>
        </div>
    );
}
