'use client';

import { X } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPreview } from '@/lib/auth/users';
import { getInitials } from '@/lib/chat/utils-chat';
import { cn } from '@/lib/utils';

interface SelectionChipProps {
    selection: UserPreview;
    onRemove: () => void;
}

export function SelectionChip({ selection, onRemove }: SelectionChipProps) {
    return (
        <span className="flex items-center gap-1.5 rounded-full border bg-muted py-1 pl-1 pr-2 text-sm">
            <Avatar className="size-5">
                <AvatarFallback className={cn('text-[10px] font-medium')}>
                    {getInitials(selection.name)}
                </AvatarFallback>
            </Avatar>
            <span className="max-w-36 truncate">{selection.name}</span>
            <Button
                variant="ghost"
                size="icon"
                className="size-4 rounded-full text-muted-foreground hover:text-foreground"
                onClick={onRemove}
                aria-label={`Remove ${selection.name}`}
            >
                <X className="size-3" />
            </Button>
        </span>
    );
}
