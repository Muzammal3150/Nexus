'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';

import { Room } from '@/features/chats/types/room';
import { createRoom } from './create-room';
import { FormRootError } from './form-root-error';
import { MemberChipList } from './member-chip-list';
import { errorMessage, resolveUser } from './resolve-user';

const MAX_NAME_LENGTH = 60;
const MAX_GROUP_MEMBERS = 50;

const groupSchema = z.object({
    groupName: z.string().trim().min(1, 'Give your group a name.').max(MAX_NAME_LENGTH),
    members: z
        .array(z.object({ id: z.string(), name: z.string() }))
        .min(2, 'Add at least 2 members to start a group.'),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export function GroupChatForm({ onSuccess }: { onSuccess: (room: Room) => void }) {
    const form = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: { groupName: '', members: [] },
    });

    const {
        fields: members,
        append,
        remove,
    } = useFieldArray({
        control: form.control,
        name: 'members',
        keyName: 'fieldId',
    });

    const searchInputRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState('');
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isInviting, setIsInviting] = useState(false);

    async function handleInvite() {
        const query = search.trim();
        if (!query) return;

        setIsInviting(true);
        setSearchError(null);

        try {
            const user = await resolveUser(query);

            if (!user) {
                setSearchError('No user found with that username, email, or phone number.');
                return;
            }

            if (members.some((m) => m.id === user.id)) {
                setSearchError('This member has already been added.');
                return;
            }

            if (members.length >= MAX_GROUP_MEMBERS) {
                setSearchError(`Groups are limited to ${MAX_GROUP_MEMBERS} members.`);
                return;
            }

            append({ id: user.id, name: user.name ?? '' });
            setSearch('');
            form.clearErrors('members');

            requestAnimationFrame(() => {
                searchInputRef.current?.focus();
            });
        } catch (err) {
            setSearchError(
                errorMessage(err, 'Something went wrong while searching. Please try again.'),
            );
        } finally {
            setIsInviting(false);
        }
    }

    async function onSubmit(values: GroupFormValues) {
        try {
            const newRoom = await createRoom({
                isGroup: true,
                name: values.groupName,
                memberIds: values.members.map((m) => m.id),
            });

            onSuccess(newRoom);
        } catch (err) {
            form.setError('root', {
                message: errorMessage(err, 'Failed to create chat. Please try again.'),
            });
        }
    }

    const busy = isInviting || form.formState.isSubmitting;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-4">
                <FormRootError message={form.formState.errors.root?.message} />
                <Field data-invalid={Boolean(form.formState.errors.groupName)}>
                    <FieldLabel htmlFor="group-name">Group name</FieldLabel>
                    <Input
                        id="group-name"
                        placeholder="e.g. Weekend Trip"
                        disabled={busy}
                        {...form.register('groupName')}
                    />
                    {form.formState.errors.groupName && (
                        <FieldError
                            errors={[{ message: form.formState.errors.groupName.message }]}
                        />
                    )}
                </Field>

                <Field data-invalid={Boolean(searchError || form.formState.errors.members)}>
                    <FieldLabel htmlFor="group-search">Add members</FieldLabel>
                    <div className="flex gap-2">
                        <InputGroup className="flex-1">
                            <InputGroupInput
                                ref={searchInputRef}
                                id="group-search"
                                placeholder="Username"
                                maxLength={MAX_NAME_LENGTH}
                                value={search}
                                disabled={busy}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    if (searchError) setSearchError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleInvite();
                                    }
                                }}
                            />
                        </InputGroup>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleInvite}
                            disabled={!search.trim() || busy}
                            aria-label="Add member"
                        >
                            {isInviting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {searchError ? (
                        <FieldError errors={[{ message: searchError }]} />
                    ) : form.formState.errors.members ? (
                        <FieldError errors={[{ message: form.formState.errors.members.message }]} />
                    ) : (
                        <FieldDescription>Press Enter or tap + to add.</FieldDescription>
                    )}
                </Field>

                <MemberChipList members={members} onRemove={remove} />

                <Button type="submit" disabled={busy} className="w-full">
                    {form.formState.isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Group'
                    )}
                </Button>
            </CardContent>
        </form>
    );
}
