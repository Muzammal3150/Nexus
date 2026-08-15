import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DrawerClose, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { format } from 'date-fns';
import { Camera, Pencil, Users, X } from 'lucide-react';
import { getInitials } from '../../lib/utils-chat';
import { Room } from '../../types/room';
import { UiState } from '@/stores/uiStore/uis';

interface GroupHeaderProps {
    room: Room;
    isAdmin: boolean;
}

export function GroupHeader({ room, isAdmin }: GroupHeaderProps) {
    const open = useUiStore((state) => state.open);
    const onEdit = () => open(UiState.Chat.GroupInfo.EditHeaderDialog);
    return (
        <DrawerHeader className="relative items-center gap-2 p-4 text-center">
            <DrawerClose
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="Close"
                    />
                }
            >
                <X className="h-4 w-4" />
            </DrawerClose>

            <button
                type="button"
                onClick={onEdit}
                disabled={!isAdmin}
                aria-label={isAdmin ? 'Edit group' : undefined}
                className="group relative mx-auto overflow-hidden rounded-full"
            >
                <Avatar className="h-20 w-20">
                    <AvatarImage src={room.image ?? undefined} alt={room.name} />
                    <AvatarFallback className="text-lg">{getInitials(room.name)}</AvatarFallback>
                </Avatar>

                {isAdmin && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Change</span>
                    </div>
                )}
            </button>

            <div className="flex items-center justify-center gap-1.5">
                <DrawerTitle className="text-lg">{room.name}</DrawerTitle>

                {isAdmin && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={onEdit}
                        aria-label="Edit group"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
            {room.isGroup && (
                <>
                    <div className="group/description flex max-w-xs items-center justify-center gap-1">
                        <DrawerDescription className="mx-auto">
                            {room.description || 'No description yet.'}
                        </DrawerDescription>

                        {isAdmin && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/description:opacity-100"
                                onClick={onEdit}
                                aria-label="Edit group description"
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{room.members.length} members</span>
                        <span aria-hidden>·</span>
                        <span>Created {format(room.createdAt, 'MMMM d, yyyy')}</span>
                    </div>
                </>
            )}
        </DrawerHeader>
    );
}
