'use client';

import { useSession } from '@/components/providers/session-provider';
import { AccountSection } from '@/components/settings/sections/account';
import { AvatarSection } from '@/components/settings/sections/change-avatar';
import { ChangePasswordForm } from '@/components/settings/sections/change-password';
import { DeleteAccount } from '@/components/settings/sections/delete-account';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const session = useSession();
    const router = useRouter();

    if (session === null) return router.push('/login');
    const { user } = session;

    return (
        <main className="space-y-8 p-8 py-12 flex-1">
            <AccountSection displayName={user.name} username={user.username} email={user.email} />
            <AvatarSection displayName={user.name} avatarUrl={user.image} />
            <ChangePasswordForm />
            <DeleteAccount />
        </main>
    );
}
