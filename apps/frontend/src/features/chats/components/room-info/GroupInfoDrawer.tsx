import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useSession } from '@/features/auth/providers/session-provider';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { Room } from '../../types/room';
import { GroupActions } from './GroupActions';
import { GroupHeader } from './GroupHeader';
import { MembersSection } from './MembersSection';
import { UiState } from '@/stores/uiStore/uis';

interface GroupInfoDrawerProps {
    room: Room;
}
export function GroupInfoDrawer({ room }: GroupInfoDrawerProps) {
    const isOpen = useUiStore((s) => s.isOpen(UiState.Chat.GroupInfo.Drawer));
    const setOpen = useUiStore((s) => s.setOpen);
    const session = useSession();
    const myMember = room.members.find(({ user }) => user.id === session?.user.id);
    const isAdmin = myMember?.role === 'admin';

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(state) => setOpen(UiState.Chat.GroupInfo.Drawer, state)}
            swipeDirection="right"
        >
            <DrawerContent className="z-10000 flex h-screen w-full max-w-none flex-col gap-0 rounded-none! sm:h-auto sm:max-w-lg sm:rounded-lg">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <GroupHeader room={room} isAdmin={isAdmin} />

                    {room.isGroup && (
                        <div className="space-y-6 px-4 pb-6">
                            <MembersSection members={room.members} isAdmin={isAdmin} />
                        </div>
                    )}

                    <DrawerFooter className="mt-0 shrink-0 border-t pt-3">
                        <GroupActions isAdmin={isAdmin} room={room} />
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
