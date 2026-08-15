import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/features/auth/providers/session-provider';
import { initCall } from '@/features/calls/lib/init-call';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { ChevronRight, MessageCircle, Phone, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { RoomMember } from '../../types/room';
import { createRoom } from '../new-chat/create-room';
import { MemberRow } from './MemberRow';
import { UiState } from '@/stores/uiStore/uis';

interface MembersSectionProps {
    members: RoomMember[];
}

export function MembersSection({ members }: MembersSectionProps) {
    const session = useSession();
    const [query, setQuery] = useState('');
    const [showAll, setShowAll] = useState(false);
    const router = useRouter();
    const close = useUiStore((state) => state.close);
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
    console.log(previewMembers);
    const handleViewAll = () => {
        if (onViewAll) {
            onViewAll();
            return;
        }

        setShowAll(true);
    };
    async function onChat(member: RoomMember) {
        const room = await createRoom({
            isGroup: false,
            name: member.user.name,
            memberIds: [member.user.id],
        });
        close(UiState.Chat.GroupInfo.Drawer);
        router.push(`/chats/${room.id}`);
    }

    async function onCall(member: RoomMember) {
        const room = await initCall({
            memberIds: [member.user.id],
        });
        close(UiState.Chat.GroupInfo.Drawer);

        router.push(`/calls/${room.id}`);
    }

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
                        previewMembers.map((member) => {
                            const isYou = member.userId === session?.user.id;

                            return (
                                <div
                                    key={`${member.roomId}-${member.userId}`}
                                    className="flex items-center"
                                >
                                    <div className="min-w-0 flex-1">
                                        <MemberRow member={member} isYou={isYou} />
                                    </div>

                                    {!isYou && (
                                        <div className="flex shrink-0 items-center gap-0.5 pr-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => onChat(member)}
                                                aria-label={`Chat with ${member.user.name}`}
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => onCall(member)}
                                                aria-label={`Call ${member.user.name}`}
                                            >
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {hasMore && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1.5 h-8 w-full justify-center gap-1 text-xs text-muted-foreground"
                    onClick={handleViewAll}
                >
                    View all {filteredMembers.length} members
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            )}

            {showAll && filteredMembers.length > previewLimit && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1.5 h-8 w-full text-xs text-muted-foreground"
                    onClick={() => setShowAll(false)}
                >
                    Show less
                </Button>
            )}
        </div>
    );
}
