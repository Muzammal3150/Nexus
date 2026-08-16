import ActivityTimeline, {
    ActivityItem,
} from '@/features/contacts/components/contacts/activity-timeline';
import DetailsCard from '@/features/contacts/components/contacts/details-card';
import GroupsList from '@/features/contacts/components/contacts/groups-list';
import MediaGrid from '@/features/contacts/components/contacts/media-grid';
import ProfileHeader from '@/features/contacts/components/contacts/profile-header';
import ProfileTabs from '@/features/contacts/components/contacts/profile-tabs';

import { ImagePlus, LogIn, UserPlus2 } from 'lucide-react';

import { Loading } from '@/components/custom-ui/loading';
import { User } from '@/features/auth/lib/auth';
import { Presence } from '@/features/presence/types';
import { api } from '@/lib/axios';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

async function getUser(username: string) {
    console.log(username);
    try {
        const { data } = await api.get<User & Presence>(`/users/${username}`);
        return data;
    } catch {
        notFound();
    }
}

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { username } = await params;
    const user = await getUser(username);

    const activity: ActivityItem[] = [
        { id: 'a1', icon: ImagePlus, label: 'Updated profile photo', date: user.updatedAt },
        {
            id: 'a2',
            icon: UserPlus2,
            label: 'Joined \u201CClimbing Crew\u201D',
            date: new Date('2025-11-02T12:00:00Z'),
        },
        { id: 'a3', icon: LogIn, label: 'Created account', date: user.createdAt },
    ];

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
                                count: 12,
                                content: (
                                    <Suspense fallback={<Loading />}>
                                        <MediaGrid userId={user.id} />
                                    </Suspense>
                                ),
                            },
                            {
                                key: 'groups',
                                label: 'Shared groups',
                                count: 0,
                                content: <GroupsList groups={[]} />,
                            },
                            {
                                key: 'activity',
                                label: 'Activity',
                                count: 0,
                                content: <ActivityTimeline items={activity} />,
                            },
                        ]}
                    />
                    <p className="px-1 font-mono text-[11px] text-center col-span-2 text-muted-foreground/70">
                        id: {user.id}
                    </p>
                </div>
            </div>
        </div>
    );
}
