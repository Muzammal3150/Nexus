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
    const myMember = room.members.find(({ user }) => user.id == session?.user.id);

    function clearChat(arg0: boolean): void {
        throw new Error('Function not implemented.');
    }

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(state) => setOpen(UiState.Chat.GroupInfo.Drawer, state)}
            swipeDirection={"right"}
        >
            {/* <GroupInfoTrigger group={group} memberCount={members.length} /> */}

            <DrawerContent className="z-10000 flex h-screen w-full max-w-none flex-col gap-4 rounded-none! sm:h-auto sm:max-w-lg sm:rounded-lg">
                <GroupHeader room={room} isAdmin={myMember?.role == 'admin'} />

                {room.isGroup && (
                    <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-2">
                        <MembersSection members={room.members} />
                    </div>
                )}

                <DrawerFooter className="pt-2">
                    <GroupActions
                        isAdmin={myMember?.role == 'admin'}
                        onClearChat={() => clearChat(true)}
                        onLeave={() => {}}
                        onDelete={() => {}}
                    />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
