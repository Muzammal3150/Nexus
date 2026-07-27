'use client';

import { AxiosError } from 'axios';
import { User } from 'better-auth';
import { AlertCircle, SearchIcon, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

import { api } from '@/lib/axios';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';

import { addRoom } from '@/lib/chat/rooms';
import { useRouter } from 'next/navigation';

const MAX_NAME_LENGTH = 60;

export default function NewChatPage() {
    // form fields
    const [chatName, setChatName] = useState('');
    const [members, setMembers] = useState<User[]>([]);

    // member search
    const [search, setSearch] = useState('');
    const [loadingMember, setLoadingMember] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const router = useRouter();
    // submit
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ name?: string; members?: string }>({});

    const removeMember = (id: string) => {
        setMembers((prev) => prev.filter((member) => member.id !== id));
    };

    const addMember = async () => {
        const value = search.trim();

        if (!value || loadingMember) return;

        setSearchError(null);

        try {
            setLoadingMember(true);

            const { data: user } = await api.get<User>('/users', {
                params: { identifier: value },
            });

            const alreadyExists = members.some((member) => member.id === user.id);

            if (alreadyExists) {
                setSearchError('This user is already in the member list.');
                return;
            }

            setMembers((prev) => [...prev, user]);
            setSearch('');
            setFieldErrors((prev) => ({ ...prev, members: undefined }));
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 404) {
                setSearchError('No user found with that username, email, or phone number.');
            } else {
                setSearchError('Something went wrong while searching for that user.');
            }
        } finally {
            setLoadingMember(false);
        }
    };

    const validate = () => {
        const errors: { name?: string; members?: string } = {};
        const trimmedName = chatName.trim();

        if (!trimmedName) {
            errors.name = 'Chat name is required.';
        } else if (trimmedName.length > MAX_NAME_LENGTH) {
            errors.name = `Chat name must be ${MAX_NAME_LENGTH} characters or fewer.`;
        }

        if (members.length === 0) {
            errors.members = 'Add at least one member to start a chat.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitError(null);

        if (!validate()) return;

        try {
            setIsSubmitting(true);

            const id = await addRoom(
                {
                    name: chatName.trim(),
                },
                members.map(({ id, name, image, email }) => ({ id, name, image, email })),
            );

            router.push(`/chats/${id}`);
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else {
                setSubmitError('Failed to create the chat. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center py-8">
            <Card className="w-full max-w-5xl">
                <CardHeader>
                    <CardTitle>New Chat</CardTitle>
                    <CardDescription>Create a private chat or group conversation.</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit} noValidate>
                    <CardContent className="grid gap-8 md:grid-cols-[1fr_320px]">
                        <div className="space-y-6">
                            <FieldGroup>
                                <Field data-invalid={Boolean(fieldErrors.name)}>
                                    <FieldLabel htmlFor="chatName">Chat Name</FieldLabel>

                                    <Input
                                        id="chatName"
                                        placeholder="Study Group"
                                        value={chatName}
                                        aria-invalid={Boolean(fieldErrors.name)}
                                        onChange={(e) => {
                                            setChatName(e.target.value);
                                            if (fieldErrors.name) {
                                                setFieldErrors((prev) => ({
                                                    ...prev,
                                                    name: undefined,
                                                }));
                                            }
                                        }}
                                    />

                                    {fieldErrors.name && (
                                        <FieldError errors={[{ message: fieldErrors.name }]} />
                                    )}
                                </Field>
                            </FieldGroup>

                            <Separator />

                            <Field data-invalid={Boolean(searchError)}>
                                <FieldLabel htmlFor="member-search">Add Member</FieldLabel>

                                <div className="flex gap-2">
                                    <InputGroup className="flex-1">
                                        <InputGroupInput
                                            id="member-search"
                                            placeholder="Username, email or phone number"
                                            value={search}
                                            aria-invalid={Boolean(searchError)}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                                if (searchError) setSearchError(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addMember();
                                                }
                                            }}
                                        />

                                        <InputGroupAddon align="inline-start">
                                            <SearchIcon className="h-4 w-4" />
                                        </InputGroupAddon>
                                    </InputGroup>

                                    <Button
                                        type="button"
                                        onClick={addMember}
                                        disabled={!search.trim() || loadingMember}
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {loadingMember ? 'Searching...' : 'Invite'}
                                    </Button>
                                </div>

                                {searchError && <FieldError errors={[{ message: searchError }]} />}
                            </Field>

                            <Separator />

                            <Field data-invalid={Boolean(fieldErrors.members)}>
                                <FieldLabel>Members ({members.length})</FieldLabel>

                                <div className="max-h-72 space-y-3 overflow-y-auto">
                                    {members.length === 0 && (
                                        <FieldDescription>No members selected.</FieldDescription>
                                    )}

                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>
                                                        {(member.name ?? '?')
                                                            .split(' ')
                                                            .map((part) => part[0])
                                                            .join('')
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMember(member.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {fieldErrors.members && (
                                    <FieldError errors={[{ message: fieldErrors.members }]} />
                                )}
                            </Field>
                        </div>

                        <div className="space-y-2">
                            <FieldLabel>Invite via QR Code</FieldLabel>

                            <FieldDescription>
                                Scan another user&apos;s QR code to add them.
                            </FieldDescription>

                            <div className="my-2 flex aspect-square items-center justify-center rounded-xl border-2 border-dashed bg-muted/30">
                                <div className="text-center">
                                    <p className="font-medium">Scan QR Code</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Coming soon
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <Separator />

                    {submitError && (
                        <div className="mx-6 mb-4 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{submitError}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 p-6 pt-0">
                        <Button type="button" variant="outline" disabled={isSubmitting}>
                            Cancel
                        </Button>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Chat'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
