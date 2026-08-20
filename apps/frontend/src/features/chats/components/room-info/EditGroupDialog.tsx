import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAvatar } from '@/features/auth/lib/utils';
import { UiState } from '@/stores/uiStore/uis';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { Camera } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getInitials } from '../../lib/utils-chat';
import { Room } from '../../types/room';

interface EditGroupForm {
    name: string;
    description: string;
}

interface EditGroupDialogProps {
    room: Room;
    onSave: (data: EditGroupForm) => void;
}

export function EditGroupDialog({ room, onSave }: EditGroupDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<EditGroupForm>({
        defaultValues: {
            name: room.name,
            description: room.description ?? '',
        },
    });
    const isOpen = useUiStore((s) => s.isOpen(UiState.Chat.GroupInfo.EditHeaderDialog));
    const setOpen = useUiStore((s) => s.setOpen);
    useEffect(() => {
        if (isOpen) {
            reset({
                name: room.name,
                description: room.description ?? '',
            });
        }
    }, [room.name, room.description, reset, isOpen]);

    const onSubmit = (data: EditGroupForm) => {
        onSave({
            name: data.name.trim(),
            description: data.description.trim(),
        });
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(state) => setOpen(UiState.Chat.GroupInfo.EditHeaderDialog, state)}
        >
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit group info</DialogTitle>
                    <DialogDescription>
                        Changes are visible to everyone in the group.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-center py-1">
                        <button
                            type="button"
                            className="group relative overflow-hidden rounded-full"
                            aria-label="Change group photo"
                        >
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={getAvatar(room.image)} alt={room.name} />
                                <AvatarFallback>{getInitials(room.name)}</AvatarFallback>
                            </Avatar>

                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                <Camera className="h-5 w-5" />
                            </div>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="group-name">Group name</Label>
                            <Input
                                id="group-name"
                                placeholder="Group name"
                                maxLength={60}
                                {...register('name', {
                                    required: 'Group name is required',
                                    validate: (value) => !!value.trim() || 'Group name is required',
                                })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="group-desc">Description</Label>
                            <Textarea
                                id="group-desc"
                                placeholder="What's this group about?"
                                maxLength={200}
                                rows={3}
                                {...register('description')}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancel
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
