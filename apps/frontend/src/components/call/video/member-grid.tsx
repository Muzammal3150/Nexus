'use client';

import { cn } from '@/lib/utils';
import { CallMember } from '@/types/calls';
import { MemberTile } from './member-tile';

function gridColsClass(count: number) {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 sm:grid-cols-3';
    return 'grid-cols-3 sm:grid-cols-4';
}

interface MemberGridProps {
    members: CallMember[];
    onFullView: (id: string) => void;
}

export function MemberGrid({ members, onFullView }: MemberGridProps) {
    return (
        <div
            className={cn(
                'grid w-full max-w-5xl auto-rows-fr gap-3 p-4',
                gridColsClass(members.length),
            )}
        >
            {members.map((m) => (
                <MemberTile key={m.user.id} member={m} onFullView={() => onFullView(m.user.id)} />
            ))}
        </div>
    );
}
