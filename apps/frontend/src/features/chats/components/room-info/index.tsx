import { useSession } from '@/features/auth/providers/session-provider';
import { Room } from '../../types/room';
import { AllMembersDialog } from './AllMembersDialog';
import { EditGroupDialog } from './EditGroupDialog';
import { GroupInfoDrawer } from './GroupInfoDrawer';
import { AddMemberDialog } from './AddMemberDialog';

export default function GroupInfo({ room }: { room: Room }) {
    // if (deleted) {
    //     return (
    //         <EndState
    //             icon={<Trash2 className="h-6 w-6" />}
    //             title="Group deleted"
    //             description={`"${group.name}" and its message history have been permanently removed.`}
    //         />
    //     );
    // }

    // if (left) {
    //     return (
    //         <EndState
    //             icon={<LogOut className="h-6 w-6" />}
    //             title="You left the group"
    //             description={`You won't receive messages from "${group.name}" anymore.`}
    //         />
    //     );
    // }

    const session = useSession();
    const myMember = room.members.find(({ user }) => user.id == session?.user.id);
    const isAdmin = myMember?.role == 'admin';

    return (
        <div className="">

            <GroupInfoDrawer room={room} />

            <AllMembersDialog
                groupName={room.name}
                members={room.members}
                isAdmin={isAdmin}
            />
            <EditGroupDialog room={room}/>

            <AddMemberDialog room={room}  />

            {/* <RemoveMemberDialog
                member={removeTarget}
                groupName={group.name}
                onOpenChange={(open) => !open && setRemoveTarget(null)}
                onConfirm={confirmRemoveMember}
            />  */}

            {/* <ClearChatDialog
                open={clearChatOpen}
                groupName={group.name}
                onOpenChange={setClearChatOpen}
                onConfirm={confirmClearChat}
            />

            <LeaveGroupDialog
                open={leaveOpen}
                groupName={group.name}
                onOpenChange={setLeaveOpen}
                onConfirm={confirmLeave}
            />

            <DeleteGroupDialog
                open={deleteOpen}
                groupName={group.name}
                onOpenChange={setDeleteOpen}
                onConfirm={confirmDelete}
            />  */}
        </div>
    );
}
