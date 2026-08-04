'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { User } from 'better-auth';
import {
    AlertCircle,
    AtSignIcon,
    Loader2,
    SearchIcon,
    UserPlus,
    Users,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { api } from '@/lib/axios';
import { chatSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

const MAX_NAME_LENGTH = 60;
const MAX_GROUP_MEMBERS = 50;

const memberSchema = z.object({
    id: z.string(),
    name: z.string(),
});


const formSchema = z.object({
    mode: z.enum(['direct', 'group']),
    groupName: z.string().max(MAX_NAME_LENGTH).optional(),
    members: z.array(memberSchema),
});

type FormValues = z.infer<typeof formSchema>;

type RoomCreateResponse =
    | { success: true; room: { id: string } }
    | { success: false; error?: string };

export function NewChatPopover() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { mode: 'direct', groupName: '', members: [] },
    });

    const {
        formState: { errors, isSubmitting },
    } = form;

    const mode = form.watch('mode');
    const {
        fields: members,
        append,
        remove,
        replace,
    } = useFieldArray({
        control: form.control,
        name: 'members',
        keyName: 'fieldId',
    });

    function switchMode(next: 'direct' | 'group') {
        if (next === mode) return;
        form.setValue('mode', next);
        if (next === 'direct' && members.length > 1) {
            replace(members.slice(0, 1));
        }
        setSearch('');
        setSearchError(null);
        form.clearErrors('members');
    }

    // shared lookup, only ever called from an explicit user action
    // (Enter / Invite button for group, submit for direct) — never on keystroke
    async function resolveUser(identifier: string): Promise<User | null> {
        setIsSearching(true);
        setSearchError(null);
        try {
            const { data } = await api.get<User>('/users/', { params: { identifier } });
            return data;
        } catch (err) {
            setSearchError(
                err instanceof AxiosError && err.response?.status === 404
                    ? 'No user found with that username, email, or phone number.'
                    : 'Something went wrong while searching. Please try again.',
            );
            return null;
        } finally {
            setIsSearching(false);
        }
    }

    async function handleInvite() {
        const query = search.trim();
        if (!query) return;

        const user = await resolveUser(query);
        if (!user) return;

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
    }

    async function onSubmit(values: FormValues) {
        let resolvedMembers = values.members;

        if (values.mode === 'direct') {
            const query = search.trim();
            if (!query) {
                form.setError('members', { message: 'Search for a member to start a chat with.' });
                return;
            }

            const user = await resolveUser(query);
            if (!user) return; // searchError is already set by resolveUser

            resolvedMembers = [{ id: user.id, name: user.name ?? '' }];
            replace(resolvedMembers);
        } else {
            if (members.length < 2) {
                form.setError('members', { message: 'Add at least 2 members to start a group.' });
                return;
            }
            if (!values.groupName?.trim()) {
                form.setError('groupName', { message: 'Give your group a name.' });
                return;
            }
        }

        const payload = {
            isGroup: values.mode === 'group',
            name: values.mode === 'group' ? values.groupName?.trim() : undefined,
            memberIds: resolvedMembers.map((m) => m.id),
        };

        try {
            const res = await new Promise<RoomCreateResponse>((resolve, reject) => {
                chatSocket.emit('room:create', payload, (response: RoomCreateResponse) => {
                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response.error ?? 'Failed to create room.'));
                    }
                });
            });

            if (!res.success) return;

            setOpen(false);
            form.reset();
            setSearch('');
            setSearchError(null);
            router.push(`/chat/${res.room.id}`);
        } catch (err) {
            form.setError('root', {
                message:
                    err instanceof AxiosError
                        ? (err.response?.data?.message ??
                          'Failed to create chat. Please try again.')
                        : err instanceof Error
                          ? err.message
                          : 'Failed to create chat. Please try again.',
            });
        }
    }

    const busy = isSearching || isSubmitting;

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                    form.reset();
                    setSearch('');
                    setSearchError(null);
                }
            }}
        >
            <PopoverTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
                <UserPlus className="h-4 w-4" />
                New Chat
            </PopoverTrigger>

            <PopoverContent className="w-96 p-0" align="end">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="w-full border-0 shadow-none">
                        <CardHeader className="gap-3">
                            <CardTitle>New Chat</CardTitle>

                            <div className="grid grid-cols-2 gap-1 rounded-lg bg-background border p-1">
                                <button
                                    type="button"
                                    onClick={() => switchMode('direct')}
                                    className={cn(
                                        'flex items-center justify-center  gap-1.5 rounded-md py-1 text-sm font-medium transition-colors',
                                        mode === 'direct'
                                            ? 'bg-muted border shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Direct
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchMode('group')}
                                    className={cn(
                                        'flex items-center justify-center gap-1.5 rounded-md py-1 text-sm font-medium transition-colors',
                                        mode === 'group'
                                            ? 'bg-muted border shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <Users className="h-3.5 w-3.5" />
                                    Group
                                </button>
                            </div>

                            <CardDescription>
                                {mode === 'direct'
                                    ? "Enter a member's details, then create the chat."
                                    : 'Add 2 or more members and name your group.'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4">
                            {mode === 'group' && (
                                <Field data-invalid={Boolean(errors.groupName)}>
                                    <FieldLabel htmlFor="group-name">Group name</FieldLabel>
                                    <Input
                                        id="group-name"
                                        placeholder="e.g. Weekend Trip"
                                        {...form.register('groupName')}
                                    />
                                    {errors.groupName && (
                                        <FieldError
                                            errors={[{ message: errors.groupName.message }]}
                                        />
                                    )}
                                </Field>
                            )}

                            <Field data-invalid={Boolean(searchError)}>
                                <FieldLabel htmlFor="member-search">
                                    {mode === 'group' ? 'Add members' : 'Member'}
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="member-search"
                                        placeholder="Username"
                                        value={search}
                                        maxLength={MAX_NAME_LENGTH}
                                        aria-invalid={Boolean(searchError)}
                                        disabled={busy}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            if (searchError) setSearchError(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && mode === 'group') {
                                                e.preventDefault();
                                                handleInvite();
                                            }
                                        }}
                                    />
                                    <InputGroupAddon>
                                        {isSearching ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        ) : mode === 'group' ? (
                                            <button
                                                type="button"
                                                onClick={handleInvite}
                                                disabled={!search.trim() || busy}
                                                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                                                aria-label="Invite member"
                                            >
                                                <AtSignIcon className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <SearchIcon className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </InputGroupAddon>
                                </InputGroup>

                                {searchError ? (
                                    <FieldError errors={[{ message: searchError }]} />
                                ) : errors.members ? (
                                    <FieldError errors={[{ message: errors.members.message }]} />
                                ) : mode === 'group' ? (
                                    <FieldDescription>
                                        Press Enter or tap + to add.
                                    </FieldDescription>
                                ) : null}
                            </Field>

                            {mode === 'group' && members.length > 0 && (
                                <FieldGroup className="flex flex-row flex-wrap gap-2">
                                    {members.map((member, index) => (
                                        <div
                                            key={member.fieldId}
                                            className="flex items-center gap-2 rounded-full border bg-muted/50 py-1 pl-1 pr-2 text-sm"
                                        >
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[10px]">
                                                    {member.name?.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="max-w-32 truncate">{member.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-muted-foreground hover:text-foreground"
                                                aria-label={`Remove ${member.name}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </FieldGroup>
                            )}

                            <Button type="submit" disabled={busy} className="w-full">
                                {isSearching ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : mode === 'direct' ? (
                                    'Create Chat'
                                ) : (
                                    'Create Group'
                                )}
                            </Button>
                        </CardContent>

                        {errors.root && (
                            <>
                                <Separator />
                                <div className="mx-6 mb-4 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{errors.root.message}</span>
                                </div>
                            </>
                        )}
                    </Card>
                </form>
            </PopoverContent>
        </Popover>
    );
}

function DirectForm() {}
