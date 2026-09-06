'use client';

import DetailsCard from '@/features/contacts/components/contacts/details-card';
import GroupsList from '@/features/contacts/components/contacts/groups-list';
import MediaGrid from '@/features/contacts/components/contacts/media-grid';
import ProfileHeader from '@/features/contacts/components/contacts/profile-header';
import ProfileTabs from '@/features/contacts/components/contacts/profile-tabs';

import { Loading } from '@/components/custom-ui/loading';
import { User } from '@/features/auth/lib/auth';
import { Presence } from '@/features/presence/types';
import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';

async function getUser(username: string) {
    const { data } = await api.get<User & Presence>(`/users/${username}`);
    return data;
}

export default function ProfilePage() {
    const { username } = useParams<{ username: string }>();

    const {
        data: user,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['user', username],
        queryFn: () => getUser(username),
        enabled: !!username,
    });

    if (isLoading) return <Loading />;
    if (isError || !user) return <div>User not found</div>;

    return (
        <div className="min-h-full w-full bg-background p-4 sm:p-6 lg:p-10">
            <div className="mx-auto w-full max-w-6xl">
                <ProfileHeader user={user} />

                <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
                    <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                        <DetailsCard user={user} />
                    </div>

                    <ProfileTabs
                        tabs={[
                            {
                                key: 'media',
                                label: 'Shared media',
                                content: (
                                    <Suspense fallback={<Loading />}>
                                        <MediaGrid userId={user.id} />
                                    </Suspense>
                                ),
                            },
                            {
                                key: 'groups',
                                label: 'Shared groups',
                                content: (
                                    <Suspense fallback={<Loading />}>
                                        <GroupsList userId={user.id} />
                                    </Suspense>
                                ),
                            },
                        ]}
                    />

                    <p className="col-span-2 px-1 text-center font-mono text-[11px] text-muted-foreground/70">
                        id: {user.id}
                    </p>
                </div>
            </div>
        </div>
    );
}
