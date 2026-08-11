'use client';

import { Check } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CommandItem } from '@/components/ui/command';
import { getInitials } from '@/lib/chat/utils-chat';
import { cn } from '@/lib/utils';
import { User } from '@/lib/auth/auth';


interface UserResultItemProps {
    user: User;
    selected: boolean;
    onSelect: () => void;
}

export function UserResultItem({ user, selected, onSelect }: UserResultItemProps) {
    return (
        <CommandItem
            value={`${user.name} ${user.username}`}
            onSelect={onSelect}
            className={cn(
                'gap-3 py-2 bg-transparent! hover:bg-muted! my-1',
                selected && 'bg-muted!',
            )}
        >
            <div className="relative shrink-0">
                <Avatar className="size-8">
                    <AvatarFallback className={cn('text-xs font-medium')}>
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                {user.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
            </div>

            <Check
                className={cn(
                    'size-4 shrink-0 text-primary',
                    selected ? 'opacity-100' : 'opacity-0',
                )}
            />
        </CommandItem>
    );
}
