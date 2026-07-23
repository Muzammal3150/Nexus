'use client';

import { useState } from 'react';
import { Paperclip, Send, Smile } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChatComposer({ onSend }: { onSend: (message: string) => void }) {
    const [value, setValue] = useState('');

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onSend?.(trimmed);

        setValue('');
    };

    return (
        <div className="flex items-center gap-2 border-t bg-background px-4 py-3">
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground">
                <Smile className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground">
                <Paperclip className="size-5" />
            </Button>
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                }}
                placeholder="Type a message"
                className="flex-1 rounded-full bg-muted"
            />
            <Button size="icon" className="size-9 rounded-full" onClick={handleSend}>
                <Send className="size-4" />
            </Button>
        </div>
    );
}
