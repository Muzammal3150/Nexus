import { formatDistanceToNow } from 'date-fns';
import { BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import AvatarWithStatus from './avatar-with-status';
import ProfileActions from './profile-actions';
import { statusLabel } from './utils';
import type { Presence, User } from './types';

interface ProfileHeaderProps {
    user: User;
    presence: Presence;
}

export default function ProfileHeader({ user, presence }: ProfileHeaderProps) {
    return (
        <Card className="overflow-hidden py-0!">
            <div className="relative h-32 w-full bg-gradient-to-br from-primary via-primary/70 to-muted lg:h-44" />

            <div className="flex flex-col gap-5 px-6 pb-6 pt-0 lg:flex-row lg:items-end lg:justify-between lg:px-8">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                    <AvatarWithStatus
                        name={user.name}
                        image={user.image}
                        status={presence.status}
                    />

                    <div className="pb-1">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
                                {user.name}
                            </h1>
                            {user.emailVerified && (
                                <BadgeCheck
                                    className="size-[19px] shrink-0 text-primary"
                                    aria-label="Verified account"
                                />
                            )}
                        </div>
                        <p className="mt-0.5 font-mono text-sm text-muted-foreground">
                            @{user.username}
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            {presence.status === 'online' ? (
                                <span className="text-emerald-500">{statusLabel.online}</span>
                            ) : (
                                <>
                                    Last seen{' '}
                                    {formatDistanceToNow(presence.lastSeen, { addSuffix: true })}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <ProfileActions user={user} />
            </div>
        </Card>
    );
}
