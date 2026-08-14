import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { PresenceStatus } from './types';
import { initials, statusDotClass } from './utils';

interface AvatarWithStatusProps {
    name: string;
    image?: string | null;
    status: PresenceStatus;
}


export default function AvatarWithStatus({ name, image, status }: AvatarWithStatusProps) {
    return (
        <div className="relative -mt-10 shrink-0 lg:-mt-12">
            <Avatar className="h-20 w-20 border-4 border-card lg:h-28 lg:w-28">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="object-cover"
                    />
                ) : (
                    <AvatarFallback className="text-lg font-semibold tracking-wide lg:text-2xl">
                        {initials(name)}
                    </AvatarFallback>
                )}
            </Avatar>
            <span
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card lg:h-5 lg:w-5 ${statusDotClass[status]}`}
            >
                {status === 'online' && (
                    <span className="absolute inset-0 rounded-full bg-emerald-500/60 motion-safe:animate-ping" />
                )}
            </span>
        </div>
    );
}
