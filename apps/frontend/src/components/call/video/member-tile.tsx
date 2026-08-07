'use client';

import { useEffect, useRef, useState } from 'react';
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
}: MemberTileProps) {
    const showControls = size !== 'thumb';

    const videoRef = useRef<HTMLVideoElement>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);

    const [speaking, setSpeaking] = useState(false);

    const stream = member.stream;

    const videoTrack = stream?.getVideoTracks()[0];
    const audioTrack = stream?.getAudioTracks()[0];

    const cameraEnabled = videoTrack?.enabled ?? false;
    const micEnabled = audioTrack?.enabled ?? false;

    useEffect(() => {
        if (!videoRef.current) return;

        videoRef.current.srcObject = stream ?? null;
    }, [stream]);

    useEffect(() => {
        if (!stream || !audioTrack) {
            setSpeaking(false);
            return;
        }

        const audioContext = new AudioContext();

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const source = audioContext.createMediaStreamSource(
            new MediaStream([audioTrack])
        );

        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
            analyser.getByteFrequencyData(data);

            const volume =
                data.reduce((sum, value) => sum + value, 0) /
                data.length;

            setSpeaking(volume > 15);

            animationRef.current =
                requestAnimationFrame(checkVolume);
        };

        checkVolume();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            audioContext.close();

            audioContextRef.current = null;
            analyserRef.current = null;
        };
    }, [stream, audioTrack]);

    return (
        <div
            className={cn(
                'group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border bg-primary/20',
                speaking &&
                    'ring-2 ring-primary ring-offset-2 ring-offset-background',
                className
            )}
        >
            {stream && cameraEnabled ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={member.isSelf}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <Avatar className={avatarSizes[size]}>
                    <AvatarFallback
                        className={cn(
                            'font-medium',
                            avatarTextSizes[size]
                        )}
                    >
                        {getInitials(member.user.name)}
                    </AvatarFallback>
                </Avatar>
            )}

            {!member.joined && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/30 backdrop-blur-sm">
                    <div className="flex gap-1">
                        {[0, 150, 300].map(delay => (
                            <div
                                key={delay}
                                className="size-2 animate-bounce rounded-full bg-primary"
                                style={{
                                    animationDelay: `${delay}ms`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {showControls && (
                <>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 backdrop-blur">
                        {!micEnabled && (
                            <MicOff className="size-3.5 text-destructive" />
                        )}

                        <span className="text-xs font-medium">
                            {member.user.name}
                            {member.isSelf && ' (You)'}
                        </span>
                    </div>

                    {!cameraEnabled && (
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
                        >
                            <Maximize2 className="size-3.5" />
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}