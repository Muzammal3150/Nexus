'use client';

import { MessageCircle, Phone, UserPlus } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/chat/utils-chat';
import { Contact } from '@/stores/contactStore';

interface ContactItemProps {
    contact: Contact;
    active?: boolean;
    onSelect: () => void;
    onChat: () => void;
    onCall: () => void;
    onAdd?: () => void;
}

export function ContactItem({
    contact,
    active,
    onSelect,
    onChat,
    onCall,
    onAdd,
}: ContactItemProps) {
    const name = contact.contact?.name ?? contact.name;
    return (
        <div
            className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                active ? 'bg-accent' : 'hover:bg-accent/60',
            )}
        >
            <button
                type="button"
                onClick={onSelect}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
                <div className="relative shrink-0">
                    <Avatar className="size-10">
                        <AvatarImage src={contact.image ?? undefined} alt={name} />
                        <AvatarFallback className={cn('text-sm font-medium')}>
                            {getInitials(name)}
                        </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {`@${contact.username}`}
                    </p>
                </div>
            </button>

            <div className="flex shrink-0 items-center gap-1">
                {onAdd && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                        onClick={onAdd}
                        aria-label={`Add ${name} to contacts`}
                    >
                        <UserPlus className="size-4" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary"
                    onClick={onCall}
                    aria-label={`Call ${name}`}
                >
                    <Phone className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary"
                    onClick={onChat}
                    aria-label={`Chat with ${name}`}
                >
                    <MessageCircle className="size-4" />
                </Button>
            </div>
        </div>
    );
}
