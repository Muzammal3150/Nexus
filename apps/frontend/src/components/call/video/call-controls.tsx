'use client';

import { Maximize, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CallControlsProps {
    muted: boolean;
    cameraOff: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onToggleFullscreen: () => void;
    onLeave: () => void;
}

export function CallControls({
    muted,
    cameraOff,
    onToggleMute,
    onToggleCamera,
    onToggleFullscreen,
    onLeave,
}: CallControlsProps) {
    return (
        <div className="flex items-center justify-center gap-2 border-t bg-background px-4 py-3">
            <Button
                variant={muted ? 'default' : 'outline'}
                size="icon"
                className="size-11 rounded-full"
                onClick={onToggleMute}
                aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
            >
                {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </Button>

            <Button
                variant={cameraOff ? 'default' : 'outline'}
                size="icon"
                className="size-11 rounded-full"
                onClick={onToggleCamera}
                aria-label={cameraOff ? 'Turn camera on' : 'Turn camera off'}
            >
                {cameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
            </Button>

            <Button
                variant="destructive"
                size="icon"
                className="size-14 rounded-full"
                onClick={onLeave}
                aria-label="Leave call"
            >
                <PhoneOff className="size-5" />
            </Button>
            <Button
                variant={'outline'}
                size="icon"
                className="size-14 rounded-full"
                onClick={onToggleFullscreen}
                aria-label="Leave call"
            >
                <Maximize  />
            </Button>

            {/* <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button variant="outline" size="icon" className="size-11 rounded-full" />
                    }
                >
                    <MoreHorizontal className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top">
                    <DropdownMenuItem onClick={onToggleFullscreen}>
                        Toggle fullscreen
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu> */}
        </div>
    );
}
