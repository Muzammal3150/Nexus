import ProfileSection from '@/components/settings/ProfileSection';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/lib/auth/auth';

import { baseSignUpValidator } from '@/validators/auth/signup';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyIcon, LockIcon } from 'lucide-react';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import z from 'zod';
import ConfirmDialog from '../alert';

const PasswordSchema = baseSignUpValidator
    .pick({ password: true, confirmPassword: true })
    .extend({ currentPassword: z.string().min(1, 'Current password is required') })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .refine((data) => data.password !== data.currentPassword, {
        message: 'New password must be different from your current password',
        path: ['password'],
    });

// Centralized helper so failures are reported consistently, whether they come
// from a thrown Error, a string, or something unexpected.
function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string' && error) return error;
    return fallback;
}

export function ChangePasswordForm() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [passwordData, setPasswordData] = useState<z.infer<typeof PasswordSchema> | null>(null);

    const form = useForm<z.infer<typeof PasswordSchema>>({
        resolver: zodResolver(PasswordSchema),
        defaultValues: {
            currentPassword: '',
            password: '',
            confirmPassword: '',
        },
    });

    function onSubmit(data: z.infer<typeof PasswordSchema>) {
        setPasswordData(data);
        setShowConfirm(true);
    }

    async function handleConfirm() {
        if (!passwordData || isPending) return;

        setIsPending(true);

        try {
            const { error } = await authClient.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.password,
                revokeOtherSessions: true,
            });

            if (error) {
                // Surface auth errors (e.g. wrong current password) on the field itself
                // when possible, not just as a toast, so the user knows what to fix.
                const message = getErrorMessage(error, 'Could not change your password.');
                form.setError('currentPassword', { type: 'server', message });
                toast.add({ type: 'error', description: message });

                return;
            }
            toast.add({ type: 'success', description: 'Password changed successfully.' });

            form.reset();
            setShowConfirm(false);
        } catch (error) {
            toast.add({
                type: 'error',
                description: getErrorMessage(
                    error,
                    'Could not change your password. Check your connection and try again.',
                ),
            });
        } finally {
            setIsPending(false);
        }
    }

    function handleOpenChange(open: boolean) {
        setShowConfirm(open);
        // If the user cancels the confirmation, clear any stale server error
        // so it doesn't linger the next time they open the dialog.
        if (!open) {
            form.clearErrors('currentPassword');
        }
    }

    return (
        <ProfileSection
            id={'change-password'}
            title={'Change Password'}
            description=" Update your password regularly to keep your account secure. You will need
                        your current password to make this change."
        >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <Field>
                    <FieldLabel htmlFor="current-password">Current Password</FieldLabel>

                    <InputGroup>
                        <InputGroupAddon>
                            <LockIcon />
                        </InputGroupAddon>

                        <InputGroupInput
                            id="current-password"
                            type="password"
                            placeholder="Current password"
                            autoComplete="current-password"
                            {...form.register('currentPassword')}
                            disabled={isPending}
                            aria-invalid={!!form.formState.errors.currentPassword}
                            aria-describedby="current-password-error"
                        />
                    </InputGroup>

                    {form.formState.errors.currentPassword && (
                        <FieldError id="current-password-error" role="alert">
                            {form.formState.errors.currentPassword.message}
                        </FieldError>
                    )}
                </Field>

                <div className="flex gap-4 items-baseline-last">
                    <Field className="flex-1">
                        <FieldLabel htmlFor="new-password">New Password</FieldLabel>

                        <InputGroup>
                            <InputGroupAddon>
                                <KeyIcon />
                            </InputGroupAddon>

                            <InputGroupInput
                                id="new-password"
                                type="password"
                                placeholder="New password"
                                autoComplete="new-password"
                                {...form.register('password')}
                                disabled={isPending}
                                aria-invalid={!!form.formState.errors.password}
                                aria-describedby="new-password-error"
                            />
                        </InputGroup>
                    </Field>

                    <Field className="flex-1">
                        <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>

                        <InputGroup>
                            <InputGroupAddon>
                                <KeyIcon />
                            </InputGroupAddon>

                            <InputGroupInput
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm password"
                                autoComplete="new-password"
                                {...form.register('confirmPassword')}
                                disabled={isPending}
                                aria-invalid={!!form.formState.errors.confirmPassword}
                                aria-describedby="confirm-password-error"
                            />
                        </InputGroup>
                    </Field>

                    <Button type="submit" variant="outline" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Change Password'}
                    </Button>
                </div>
                {form.formState.errors.confirmPassword && (
                    <FieldError id="confirm-password-error" role="alert">
                        {form.formState.errors.confirmPassword.message}
                    </FieldError>
                )}

                {form.formState.errors.password && (
                    <FieldError id="new-password-error" role="alert">
                        {form.formState.errors.password.message}
                    </FieldError>
                )}
                <ConfirmDialog
                    open={showConfirm}
                    title="Change Password?"
                    description="Are you sure you want to update your password?"
                    confirmText="Yes, change it"
                    cancelText="Cancel"
                    onConfirm={handleConfirm}
                    onOpenChange={handleOpenChange}
                />
            </form>
        </ProfileSection>
    );
}
