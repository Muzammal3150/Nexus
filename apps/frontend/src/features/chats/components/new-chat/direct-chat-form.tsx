'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

import { Room } from '@/features/chats/types/room';
import { createRoom } from './create-room';
import { FormRootError } from './form-root-error';
import { errorMessage, resolveUser } from './resolve-user';

const MAX_NAME_LENGTH = 60;

const directSchema = z.object({
    username: z.string().trim().min(1, 'Search for a member to start a chat with.'),
});

type DirectFormValues = z.infer<typeof directSchema>;

export function DirectChatForm({ onSuccess }: { onSuccess: (room: Room) => void }) {
    const [phase, setPhase] = useState<'idle' | 'verifying' | 'creating'>('idle');

    const form = useForm<DirectFormValues>({
        resolver: zodResolver(directSchema),
        defaultValues: { username: '' },
    });

    async function onSubmit(values: DirectFormValues) {
        setPhase('verifying');
        try {
            const user = await resolveUser(values.username);
            if (!user) {
                form.setError('username', {
                    message: 'No user found with that username, email, or phone number.',
                });
                return;
            }

            setPhase('creating');
            const newRoom = await createRoom({ isGroup: false, memberIds: [user.id] });
            onSuccess(newRoom);
        } catch (err) {
            form.setError('root', {
                message: errorMessage(err, 'Failed to create chat. Please try again.'),
            });
        } finally {
            setPhase('idle');
        }
    }

    const busy = phase !== 'idle' || form.formState.isSubmitting;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-4">
                <Field data-invalid={Boolean(form.formState.errors.username)}>
                    <FieldLabel htmlFor="direct-search">Member</FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            id="direct-search"
                            placeholder="Username"
                            maxLength={MAX_NAME_LENGTH}
                            disabled={busy}
                            {...form.register('username')}
                        />
                        <InputGroupAddon>
                            {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                                <SearchIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                        </InputGroupAddon>
                    </InputGroup>
                    {form.formState.errors.username && (
                        <FieldError
                            errors={[{ message: form.formState.errors.username.message }]}
                        />
                    )}
                </Field>

                <Button type="submit" disabled={busy} className="w-full">
                    {phase === 'verifying' ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : phase === 'creating' ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Chat'
                    )}
                </Button>
            </CardContent>

            <FormRootError message={form.formState.errors.root?.message} />
        </form>
    );
}
