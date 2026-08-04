'use client';

import { useEffect, useRef } from 'react';
import { Maximize2, MicOff, VideoOff } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/chat/utils-chat';
import { cn } from '@/lib/utils';

import { CallMember } from '@/types/calls';

interface MemberTileProps {
    member: CallMember;
    onFullView?: () => void;
    className?: string;
    size?: 'default' | 'large' | 'thumb';
    stream?: MediaStream;
}

const avatarSizes = {
    thumb: 'size-9',
    default: 'size-16',
    large: 'size-28',
} as const;

const avatarTextSizes = {
    thumb: 'text-sm',
    default: 'text-lg',
    large: 'text-3xl',
} as const;

export function MemberTile({
    member,
    onFullView,
    className,
    size = 'default',
    stream,
}: MemberTileProps) {
    const showControls = size !== 'thumb';

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        videoRef.current.srcObject = stream ?? null;
    }, [stream]);

    return (
        <div
            className={cn(
                'group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border bg-primary/20',
                member.speaking && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                className,
            )}
        >
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={member.isSelf}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <Avatar className={avatarSizes[size]}>
                    <AvatarFallback className={cn('font-medium', avatarTextSizes[size])}>
                        {getInitials(member.user.name)}
                    </AvatarFallback>
                </Avatar>
            )}

            {!member.joined && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/30 backdrop-blur-sm">
                    <div className="flex gap-1">
                        {[0, 150, 300].map((delay) => (
                            <div
                                key={delay}
                                className="size-2 animate-bounce rounded-full bg-primary"
                                style={{ animationDelay: `${delay}ms` }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {showControls && (
                <>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 backdrop-blur">
                        {!member.state.mic && <MicOff className="size-3.5 text-destructive" />}

                        <span className="text-xs font-medium">
                            {member.user.name}
                            {member.isSelf && ' (You)'}
                        </span>
                    </div>

                    {!member.state.camera && (
                        <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-md bg-background/70">
                            <VideoOff className="size-3.5 text-muted-foreground" />
                        </div>
                    )}

                    {onFullView && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute bottom-2 right-2 size-7 opacity-0 shadow transition-opacity group-hover:opacity-100"
                            onClick={onFullView}
                            aria-label={`Full view of ${member.user.name}`}
                        >
                            <Maximize2 className="size-3.5" />
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
