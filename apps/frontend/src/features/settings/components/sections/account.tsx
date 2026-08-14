import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/features/auth/lib/auth';
import { baseSignUpValidator } from '@/features/auth/validators/signup';
import ProfileSection from '@/features/settings/components/ProfileSection';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon, UserIcon } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import z from 'zod';
import ConfirmDialog from '../alert';

const UsernameSchema = baseSignUpValidator.pick({ username: true });
const displayNameSchema = baseSignUpValidator.pick({ name: true });
const EmailSchema = baseSignUpValidator.pick({ email: true });

// Centralized helper so every form reports failures the same way,
// whether they come from a thrown Error, a string, or something unexpected.
function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string' && error) return error;
    return fallback;
}

export function AccountSection({
    username,
    email,
    displayName,
}: {
    username: string;
    email: string;
    displayName: string;
}) {
    return (
        <ProfileSection id="account" description={'Change email & password'} title={'Account'}>
            <ChangeDisplayNameForm displayName={displayName} />
            <ChangeUsernameForm username={username} />
            <ChangeEmailForm email={email} />
        </ProfileSection>
    );
}

export function ChangeDisplayNameForm({ displayName }: { displayName: string }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');

    const form = useForm<z.infer<typeof displayNameSchema>>({
        resolver: zodResolver(displayNameSchema),
        defaultValues: {
            name: displayName,
        },
    });

    useEffect(() => {
        form.reset({
            name: displayName,
        });
    }, [displayName, form]);

    function onSubmit(data: z.infer<typeof displayNameSchema>) {
        // No-op guard: skip the confirm dialog + API call if nothing changed.
        if (data.name === displayName) {
            toast.add({ type: 'info', description: 'That is already your display name.' });
            return;
        }
        setNewDisplayName(data.name);
        setShowConfirm(true);
    }

    async function handleConfirm() {
        if (!newDisplayName || isPending) return;

        setIsPending(true);

        try {
            const { error } = await authClient.updateUser({
                name: newDisplayName,
            });

            if (error) {
                toast.add({
                    type: 'error',
                    description: getErrorMessage(error, 'Could not update your display name.'),
                });
                return;
            }
            toast.add({
                type: 'success',
                description: `Name changed to ${newDisplayName} successfully.`,
            });

            setShowConfirm(false);
        } catch (error) {
            toast.add({
                type: 'error',
                description: getErrorMessage(
                    error,
                    'Could not update your display name. Check your connection and try again.',
                ),
            });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field>
                <FieldLabel htmlFor="display-name">Display Name</FieldLabel>

                <FieldDescription>This is your public display name.</FieldDescription>

                <div className="flex gap-2">
                    <InputGroup>
                        <InputGroupAddon>
                            <UserIcon />
                        </InputGroupAddon>

                        <InputGroupInput
                            id="display-name"
                            type="text"
                            placeholder="you@example.com"
                            {...form.register('name')}
                            disabled={isPending}
                            aria-invalid={!!form.formState.errors.name}
                            aria-describedby="display-name-error"
                        />
                    </InputGroup>

                    <Button type="submit" variant="outline" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Change Username'}
                    </Button>
                </div>

                {form.formState.errors.name && (
                    <FieldError id="display-name-error" role="alert">
                        {form.formState.errors.name.message}
                    </FieldError>
                )}
            </Field>

            <ConfirmDialog
                open={showConfirm}
                title="Change display name?"
                description={`Are you sure you want to change your display name to "${newDisplayName}"?`}
                confirmText="Yes, change it"
                cancelText="Cancel"
                onConfirm={handleConfirm}
                onOpenChange={setShowConfirm}
            />
        </form>
    );
}

export function ChangeUsernameForm({ username }: { username: string }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    const form = useForm<z.infer<typeof UsernameSchema>>({
        resolver: zodResolver(UsernameSchema),
        defaultValues: { username },
    });

    useEffect(() => {
        form.reset({ username });
    }, [username, form]);

    function onSubmit(data: z.infer<typeof UsernameSchema>) {
        if (data.username === username) {
            toast.add({ type: 'info', description: 'That is already your username.' });
            return;
        }
        setNewUsername(data.username);
        setShowConfirm(true);
    }

    async function handleConfirm() {
        if (!newUsername || isPending) return;

        setIsPending(true);

        try {
            const { error } = await authClient.updateUser({
                username: newUsername,
            });

            if (error) {
                toast.add({
                    type: 'error',
                    description: getErrorMessage(error, 'Could not update your username.'),
                });
                return;
            }
            toast.add({
                type: 'success',
                description: `Username changed to ${newUsername} successfully.`,
            });

            setShowConfirm(false);
        } catch (error) {
            toast.add({
                type: 'error',
                description: getErrorMessage(
                    error,
                    'Could not update your username. Check your connection and try again.',
                ),
            });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>

                <FieldDescription>This is your username.</FieldDescription>

                <div className="flex gap-2">
                    <InputGroup>
                        <InputGroupAddon>
                            <UserIcon />
                        </InputGroupAddon>

                        <InputGroupInput
                            id="username"
                            type="text"
                            placeholder="you@example.com"
                            {...form.register('username')}
                            disabled={isPending}
                            aria-invalid={!!form.formState.errors.username}
                            aria-describedby="username-error"
                        />
                    </InputGroup>

                    <Button type="submit" variant="outline" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Change Username'}
                    </Button>
                </div>

                {form.formState.errors.username && (
                    <FieldError id="username-error" role="alert">
                        {form.formState.errors.username.message}
                    </FieldError>
                )}
            </Field>

            <ConfirmDialog
                open={showConfirm}
                title="Change username?"
                description={`Are you sure you want to change your username to "${newUsername}"?`}
                confirmText="Yes, change it"
                cancelText="Cancel"
                onConfirm={handleConfirm}
                onOpenChange={setShowConfirm}
            />
        </form>
    );
}

export function ChangeEmailForm({ email }: { email: string }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    const form = useForm<z.infer<typeof EmailSchema>>({
        resolver: zodResolver(EmailSchema),
        defaultValues: {
            email,
        },
    });

    useEffect(() => {
        form.reset({ email });
    }, [email, form]);

    function onSubmit(data: z.infer<typeof EmailSchema>) {
        if (data.email === email) {
            toast.add({ type: 'info', description: 'That is already your email address.' });
            return;
        }
        setNewEmail(data.email);
        setShowConfirm(true);
    }

    async function handleConfirm() {
        if (!newEmail || isPending) return;

        setIsPending(true);

        try {
            const { error } = await authClient.changeEmail({
                newEmail,
            });

            if (error) {
                toast.add({
                    type: 'error',
                    description: getErrorMessage(error, 'Could not update your email.'),
                });
                return;
            }
            toast.add({ type: 'success', description: 'Email changed successfully.' });

            setShowConfirm(false);
        } catch (error) {
            toast.add({
                type: 'error',
                description: getErrorMessage(
                    error,
                    'Could not update your email. Check your connection and try again.',
                ),
            });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>

                <div className="flex gap-2">
                    <InputGroup>
                        <InputGroupAddon>
                            <MailIcon />
                        </InputGroupAddon>

                        <InputGroupInput
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...form.register('email')}
                            disabled={isPending}
                            aria-invalid={!!form.formState.errors.email}
                            aria-describedby="email-error"
                        />
                    </InputGroup>

                    <Button type="submit" variant="outline" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Change Email'}
                    </Button>
                </div>

                {form.formState.errors.email && (
                    <FieldError id="email-error" role="alert">
                        {form.formState.errors.email.message}
                    </FieldError>
                )}
            </Field>

            <ConfirmDialog
                open={showConfirm}
                title="Change Email?"
                description={`Change email to "${newEmail}"?`}
                confirmText="Yes, change it"
                cancelText="Cancel"
                onConfirm={handleConfirm}
                onOpenChange={setShowConfirm}
            />
        </form>
    );
}
