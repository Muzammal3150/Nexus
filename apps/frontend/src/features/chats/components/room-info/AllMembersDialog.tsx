import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useSession } from '@/features/auth/providers/session-provider';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { RoomMember } from '../../types/room';
import { MemberRowWithActions } from './MemberRowWithActions';
import { UiState } from '@/stores/uiStore/uis';

interface AllMembersDialogProps {
    groupName: string;
    members: RoomMember[];
    isAdmin: boolean;
    onToggleRole: (member: RoomMember) => void;
    onRemove: (member: RoomMember) => void;
    onAddMembers: () => void;
}

export function AllMembersDialog({
    groupName,
    members,
    isAdmin,
    onToggleRole,
    onRemove,
    onAddMembers,
}: AllMembersDialogProps) {
    const session = useSession();
    const isOpen = useUiStore((s) => s.isOpen(UiState.Chat.GroupInfo.MembersDialog));
    const setOpen = useUiStore((s) => s.setOpen);
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return members;
        return members.filter(
            (m) =>
                m.user.name.toLowerCase().includes(q) || m.user.username.toLowerCase().includes(q),
        );
    }, [members, query]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(state) => setOpen(UiState.Chat.GroupInfo.MembersDialog, state)}
        >
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-1.5">
                        <DialogTitle>All members</DialogTitle>
                        <Badge variant="secondary" className="text-[10px]">
                            {members.length}
                        </Badge>
                    </div>
                    <DialogDescription>
                        Everyone currently in &quot;{groupName}&quot;.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search members"
                            className="pl-8"
                        />
                    </div>

                    <ScrollArea className="h-72 rounded-md border">
                        <div className="divide-y">
                            {filtered.length === 0 && (
                                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    No members match &quot;{query}&quot;
                                </p>
                            )}
                            {filtered.map((m) => (
                                <MemberRowWithActions
                                    key={m.userId}
                                    member={m}
                                    isYou={m.user.id === session?.user.id}
                                    canManage={isAdmin}
                                    onToggleRole={onToggleRole}
                                    onRemove={onRemove}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button variant="secondary" className="w-full" onClick={onAddMembers}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add members
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
