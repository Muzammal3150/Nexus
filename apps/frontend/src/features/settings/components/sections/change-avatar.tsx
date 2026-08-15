import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/features/auth/lib/auth';
import ProfileSection from '@/features/settings/components/profile-section';
import { cn } from '@/lib/utils';
import { CameraIcon, ImageIcon, Loader2Icon } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { useRefetchSession } from '@/features/auth/providers/session-provider';
import { api } from '@/lib/axios';
import ConfirmDialog from '../alert';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string' && error) return error;
    return fallback;
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return 'Please choose a PNG, JPG, WEBP, or GIF image.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return 'Image must be smaller than 5MB.';
    }
    return null;
}

export function AvatarSection({
    avatarUrl,
    displayName,
}: {
    avatarUrl?: string | null;
    displayName: string;
}) {
    const refreshSession = useRefetchSession();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fieldError, setFieldError] = useState<string | null>(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMode, setConfirmMode] = useState<'upload' | 'remove'>('upload');
    const [isPending, setIsPending] = useState(false);

    // Revoke the object URL when it's replaced or the component unmounts,
    // so we don't leak memory across repeated selections.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    function resetSelection() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        setFieldError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setFieldError(validationError);
            setSelectedFile(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFieldError(null);
        setSelectedFile(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        setConfirmMode('upload');
        setShowConfirm(true);
    }

    function handleAvatarClick() {
        if (isPending) return;
        fileInputRef.current?.click();
    }

    function handleAvatarKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleAvatarClick();
        }
    }

    function handleRemoveClick() {
        setConfirmMode('remove');
        setShowConfirm(true);
    }

    async function handleConfirm() {
        if (isPending) return;

        if (confirmMode === 'upload') {
            if (!selectedFile) return;

            setIsPending(true);
            const formData = new FormData();
            formData.append('avatar', selectedFile);
            try {
                await api.post('/users/avatar', formData);
                await refreshSession();
                toast.add({ type: 'success', description: 'Avatar updated successfully.' });

                // TODO: refresh the useSession hook here so the new avatar
                // shows up everywhere else in the app without a reload.
                setShowConfirm(false);
                resetSelection();
            } catch (error) {
                toast.add({
                    type: 'error',
                    description: getErrorMessage(
                        error,
                        'Could not upload your avatar. Check your connection and try again.',
                    ),
                });
            } finally {
                setIsPending(false);
            }
            return;
        }

        // confirmMode === 'remove'
        setIsPending(true);
        try {
            const { error } = await authClient.updateUser({
                image: null,
            });

            if (error) {
                toast.add({
                    type: 'error',
                    description: getErrorMessage(error, 'Could not remove your avatar.'),
                });
                return;
            }

            toast.add({ type: 'success', description: 'Avatar removed successfully.' });

            // TODO: refresh the useSession hook here too, once wired up above.
            setShowConfirm(false);
            resetSelection();
        } catch (error) {
            toast.add({
                type: 'error',
                description: getErrorMessage(
                    error,
                    'Could not remove your avatar. Check your connection and try again.',
                ),
            });
        } finally {
            setIsPending(false);
        }
    }

    function handleOpenChange(open: boolean) {
        setShowConfirm(open);
        // If the user cancels an upload, drop the staged file/preview too,
        // otherwise the avatar would look changed without actually saving.
        if (!open && confirmMode === 'upload') {
            resetSelection();
        }
    }

    const displayedSrc = previewUrl ?? avatarUrl ?? undefined;

    return (
        <ProfileSection
            id="avatar"
            title="Avatar"
            description="Upload an image to personalize your account. PNG, JPG, WEBP, or GIF, up to 5MB."
        >
            <Field>
                <FieldLabel htmlFor="avatar-upload">Profile picture</FieldLabel>

                <div className="flex items-start gap-5">
                    <div
                        role="button"
                        tabIndex={isPending ? -1 : 0}
                        aria-label="Change profile picture"
                        aria-disabled={isPending}
                        onClick={handleAvatarClick}
                        onKeyDown={handleAvatarKeyDown}
                        className={cn(
                            'group relative h-20 w-20 shrink-0 rounded-full outline-none',
                            'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isPending ? 'cursor-not-allowed opacity-80' : 'cursor-pointer',
                        )}
                    >
                        <Avatar className="h-20 w-20">
                            <AvatarImage
                                src={displayedSrc}
                                alt={displayName}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-lg">
                                {getInitials(displayName) || <ImageIcon className="h-6 w-6" />}
                            </AvatarFallback>
                        </Avatar>

                        {/* Hover / focus overlay */}
                        <div
                            className={cn(
                                'absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-black/60 text-white transition-opacity',
                                isPending
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                            )}
                        >
                            {isPending ? (
                                <Loader2Icon className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <CameraIcon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium leading-none">
                                        Change
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-sm text-muted-foreground">
                            Click your photo to upload a new one.
                        </p>

                        {avatarUrl && (
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleRemoveClick}
                                className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline disabled:pointer-events-none disabled:opacity-50"
                            >
                                Remove photo
                            </button>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        id="avatar-upload"
                        type="file"
                        accept={ACCEPTED_TYPES.join(',')}
                        className="hidden"
                        disabled={isPending}
                        onChange={handleFileChange}
                        aria-invalid={!!fieldError}
                        aria-describedby="avatar-upload-error"
                    />
                </div>

                <FieldDescription>
                    Square images look best. We&apos;ll crop it to a circle.
                </FieldDescription>

                {fieldError && (
                    <FieldError id="avatar-upload-error" role="alert">
                        {fieldError}
                    </FieldError>
                )}
            </Field>

            <ConfirmDialog
                open={showConfirm}
                title={confirmMode === 'upload' ? 'Update avatar?' : 'Remove avatar?'}
                description={
                    confirmMode === 'upload'
                        ? 'Are you sure you want to update your profile picture?'
                        : 'Are you sure you want to remove your profile picture? This cannot be undone.'
                }
                confirmText={confirmMode === 'upload' ? 'Yes, update it' : 'Yes, remove it'}
                cancelText="Cancel"
                onConfirm={handleConfirm}
                onOpenChange={handleOpenChange}
            />
        </ProfileSection>
    );
}
