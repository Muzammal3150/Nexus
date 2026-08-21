import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/features/auth/providers/session-provider';
import { UiState } from '@/stores/uiStore/uis';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { ChevronRight, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RoomMember } from '../../types/room';
import { MemberRowWithActions } from './MemberRowWithActions';

interface MembersSectionProps {
    members: RoomMember[];
    isAdmin: boolean;
}

export function MembersSection({ members, isAdmin }: MembersSectionProps) {
    const session = useSession();
    const [query, setQuery] = useState('');
    const [showAll, setShowAll] = useState(false);

    const open = useUiStore((state) => state.open);

    const filteredMembers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) return members;

        return members.filter((member) => {
            const user = member.user;
            const name = user.name?.toLowerCase() || '';
            const username = user.username?.toLowerCase() || '';
            const email = user.email?.toLowerCase() || '';

            return (
                name.includes(normalizedQuery) ||
                username.includes(normalizedQuery) ||
                email.includes(normalizedQuery)
            );
        });
    }, [members, query]);

    const previewLimit = 5;
    const previewMembers = showAll ? filteredMembers : filteredMembers.slice(0, previewLimit);

    const hasMore = filteredMembers.length > previewLimit && !showAll;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-medium text-muted-foreground">Members</h2>
                    <Badge variant="secondary" className="text-[10px]">
                        {members.length}
                    </Badge>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => open(UiState.Chat.GroupInfo.AddMemberDialog)}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                </Button>
            </div>

            <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setShowAll(false);
                    }}
                    placeholder="Search members"
                    className="pl-8"
                />
            </div>

            <div className="rounded-lg border">
                <div className="divide-y">
                    {previewMembers.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            {query ? `No members match "${query}"` : 'No members yet'}
                        </p>
                    ) : (
                        previewMembers.map((member) => (
                            <MemberRowWithActions
                                member={member}
                                isYou={member.userId === session?.user.id}
                                key={member.roomId + member.userId}
                                canManage={isAdmin}


                            />
                        ))
                    )}
                </div>
            </div>

            {hasMore && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1.5 h-8 w-full justify-center gap-1 text-xs text-muted-foreground"
                    onClick={() => open(UiState.Chat.GroupInfo.MembersDialog)}
                >
                    View all {filteredMembers.length} members
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
}
