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
import { api } from '@/lib/axios';
import { getUpload } from '@/lib/utils';
import { UiState } from '@/stores/uiStore/uis';
import { useUiStore } from '@/stores/uiStore/uiStore';
import { Camera, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getInitials } from '../../lib/utils-chat';
import { Room } from '../../types/room';

const editGroupSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Group name is required')
        .max(60, 'Group name cannot exceed 60 characters'),
    description: z.string().trim().max(200, 'Description cannot exceed 200 characters'),
    avatar: z
        .instanceof(File)
        .nullable()
        .refine((file) => !file || file.type.startsWith('image/'), 'Please select an image file')
        .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'Image must be smaller than 5 MB'),
});

type EditGroupForm = z.infer<typeof editGroupSchema>;

interface EditGroupDialogProps {
    room: Room;
}

export function EditGroupDialog({ room }: EditGroupDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        formState: { isSubmitting, errors },
    } = useForm<EditGroupForm>({
        resolver: zodResolver(editGroupSchema),
        defaultValues: {
            name: room.name,
            description: room.description ?? '',
            avatar: null,
        },
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isOpen = useUiStore((s) => s.isOpen(UiState.Chat.GroupInfo.EditHeaderDialog));
    const setOpen = useUiStore((s) => s.setOpen);

    useEffect(() => {
        if (!isOpen) return;

        reset({
            name: room.name,
            description: room.description ?? '',
            avatar: null,
        });

        setAvatarPreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [isOpen, room.name, room.description, reset]);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        clearErrors('avatar');

        if (!file) {
            setValue('avatar', null, { shouldValidate: true });
            setAvatarPreview(null);
            return;
        }

        setValue('avatar', file, {
            shouldValidate: true,
            shouldDirty: true,
        });

        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: EditGroupForm) => {
        clearErrors('root.server');

        try {
            const formData = new FormData();

            formData.append('name', data.name);
            formData.append('description', data.description);

            if (data.avatar) {
                formData.append('avatar', data.avatar);
            }

            await api.patch(`/rooms/${room.id}`, formData);

            setOpen(UiState.Chat.GroupInfo.EditHeaderDialog, false);
        } catch (error: any) {
            console.error('Failed to update group:', error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Failed to update group information. Please try again.';

            setError('root.server', {
                type: 'server',
                message,
            });
        }
    };

    const avatarSrc = avatarPreview || getUpload(room.avatar);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(state) => {
                if (!isSubmitting) {
                    setOpen(UiState.Chat.GroupInfo.EditHeaderDialog, state);
                }
            }}
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
                        <div className="relative">
                            <button
                                type="button"
                                className="group relative overflow-hidden rounded-full disabled:pointer-events-none disabled:opacity-50"
                                aria-label="Change group photo"
                                disabled={isSubmitting}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={avatarSrc} alt={room.name} />
                                    <AvatarFallback>{getInitials(room.name)}</AvatarFallback>
                                </Avatar>

                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    <Camera className="h-5 w-5" />
                                </div>
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                disabled={isSubmitting}
                                {...register('avatar')}
                                onChange={handleAvatarChange}
                            />
                        </div>
                    </div>

                    {errors.avatar && (
                        <p className="text-center text-sm text-destructive">
                            {errors.avatar.message}
                        </p>
                    )}

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="group-name">Group name</Label>

                            <Input
                                id="group-name"
                                placeholder="Group name"
                                maxLength={60}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.name}
                                {...register('name')}
                            />

                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="group-desc">Description</Label>

                            <Textarea
                                id="group-desc"
                                placeholder="What's this group about?"
                                maxLength={200}
                                rows={3}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.description}
                                {...register('description')}
                            />

                            {errors.description && (
                                <p className="text-sm text-destructive">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {errors.root?.server && (
                        <div
                            role="alert"
                            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        >
                            {errors.root.server.message}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button type="button" variant="outline" disabled={isSubmitting} />
                            }
                        >
                            Cancel
                        </DialogClose>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
