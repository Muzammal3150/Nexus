'use client';

import { useSession } from '@/features/auth/providers/session-provider';
import { AccountSection } from '@/features/settings/components/sections/account';
import { AvatarSection } from '@/features/settings/components/sections/change-avatar';
import { ChangePasswordForm } from '@/features/settings/components/sections/change-password';
import { DataControlsSection } from '@/features/settings/components/sections/data-controls';
import { DeleteAccount } from '@/features/settings/components/sections/delete-account';
import { getUpload } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const session = useSession();
    const router = useRouter();

    if (session === null) return router.push('/login');
    const { user } = session;

    return (
        <main className="space-y-8 p-8 py-12 flex-1">
            <AccountSection displayName={user.name} username={user.username} email={user.email} />
            <AvatarSection displayName={user.name} avatarUrl={getUpload(user.image)} />
            <ChangePasswordForm />
            <DeleteAccount />
            <DataControlsSection />

        </main>
    );
}
