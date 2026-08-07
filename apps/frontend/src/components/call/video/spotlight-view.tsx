'use client';

import { Minimize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CallMember } from '@/types/calls';
import { MemberTile } from './member-tile';

interface SpotlightViewProps {
    focusedId: string;
    onBackToGrid: () => void;
    onFocus: (id: string) => void;
    members: CallMember[];
}

export function SpotlightView({ focusedId, onBackToGrid, onFocus, members }: SpotlightViewProps) {
    const focused = members.find((m) => m.user.id === focusedId);
    const others = members.filter((m) => m.user.id !== focusedId);
    return (
        <div className="flex w-full max-w-5xl flex-1 flex-col gap-3 p-4">
            <div className="relative flex-1">
                <MemberTile
                    member={focused!}
                    size="large"
                    className="h-full max-h-[70vh] aspect-auto"
                />
                <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-3 top-3 gap-1.5 shadow"
                    onClick={onBackToGrid}
                >
                    <Minimize2 className="size-3.5" />
                    Back to grid
                </Button>
            </div>

            {others.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {others.map((member) => (
                        <button
                            key={member.user.id}
                            onClick={() => onFocus(member.user.id)}
                            className={cn(
                                'w-40 shrink-0 rounded-xl transition-transform hover:scale-[1.02]',
                            )}
                        >
                            <MemberTile member={member} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
