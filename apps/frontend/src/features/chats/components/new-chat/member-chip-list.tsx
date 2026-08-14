import { X } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FieldGroup } from '@/components/ui/field';

type Member = { fieldId: string; name: string };

export function MemberChipList({
    members,
    onRemove,
}: {
    members: Member[];
    onRemove: (index: number) => void;
}) {
    if (members.length === 0) return null;

    return (
        <FieldGroup className="flex flex-row flex-wrap gap-2">
            {members.map((member, index) => (
                <div
                    key={member.fieldId}
                    className="flex items-center gap-2 rounded-full border bg-muted/50 py-1 pl-1 pr-2 text-sm"
                >
                    <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                            {member.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="max-w-32 truncate">{member.name}</span>
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${member.name}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}
        </FieldGroup>
    );
}
