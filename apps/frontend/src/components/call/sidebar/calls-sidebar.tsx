'use client';

import { Search, SquarePen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FavouriteItem } from './favourite-item';
import { RecentCallItem } from './recent-call-item';
import { useUiStore } from '@/stores/uiStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function CallsSidebar({ className }: { className?: string }) {
    const [query, setQuery] = useState('');
    const q = query.toLowerCase();

    const favourites = [];
    const recents = [];

    const filteredFavourites = favourites.filter((f) => f.name.toLowerCase().includes(q));
    const filteredRecents = recents.filter((r) => r.name.toLowerCase().includes(q));
    const open = useUiStore((s) => s.open);

    return (
        <div className={cn('flex shrink-0 flex-col border-r ', className)}>
            <div className="flex items-center justify-between px-4 py-3">
                <h2 className="text-lg font-semibold tracking-tight">Calls</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => open('new-call-dialog')}
                >
                    <SquarePen className="size-4" />
                </Button>
            </div>

            <div className="px-3 pb-2">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search calls"
                        className="bg-muted pl-9"
                    />
                </div>
            </div>

            <Separator />

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-4 p-2 py-3">
                    {filteredFavourites.length > 0 && (
                        <div>
                            <h3 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Favourites
                            </h3>
                            <div className="flex flex-col gap-0.5">
                                {filteredFavourites.map((contact) => (
                                    <FavouriteItem
                                        key={contact.id}
                                        contact={contact}
                                        onCall={(method) => onCallFavourite(contact, method)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredFavourites.length > 0 && filteredRecents.length > 0 && <Separator />}

                    {filteredRecents.length > 0 && (
                        <div>
                            <h3 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Recents
                            </h3>
                            <div className="flex flex-col gap-0.5">
                                {filteredRecents.map((call) => (
                                    <RecentCallItem
                                        key={call.id}
                                        call={call}
                                        onCallBack={() => onCallBackRecent(call)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredFavourites.length === 0 && filteredRecents.length === 0 && (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No calls found.
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
