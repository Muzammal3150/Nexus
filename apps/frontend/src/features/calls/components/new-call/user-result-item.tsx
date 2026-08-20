'use client';

import { Check } from 'lucide-react';

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommandItem } from '@/components/ui/command';
import { getInitials } from '@/features/chats/lib/utils-chat';
import { Contact } from '@/features/contacts/stores/contact-store';
import { cn } from '@/lib/utils';
import { getAvatar } from '@/features/auth/lib/utils';

interface UserResultItemProps {
    user: Contact;
    selected: boolean;
    onSelect: () => void;
}

export function UserResultItem({ user, selected, onSelect }: UserResultItemProps) {
    return (
        <CommandItem
            value={`${user.name} ${user.contact?.name} ${user.username}`}
            onSelect={onSelect}
            className={cn(
                'gap-3 py-2 bg-transparent! hover:bg-muted! my-1',
                selected && 'bg-muted!',
            )}
        >
            <div className="relative shrink-0">
                <Avatar className="size-8">
                    <AvatarImage src={getAvatar(user.image)} />
                    <AvatarFallback className={cn('text-xs font-medium')}>
                        {getInitials(user.name)}
                    </AvatarFallback>
                    {user.isOnline && <AvatarBadge className="bg-emerald-500" />}
                </Avatar>
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">
                    {user.name ?? user.contact?.name}
                </p>
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
