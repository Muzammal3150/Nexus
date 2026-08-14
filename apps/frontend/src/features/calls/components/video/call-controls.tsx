'use client';

import {
    Camera,
    CameraOff,
    Maximize,
    Mic,
    MicOff,
    Pause,
    PhoneOff,
    Play,
    SwitchCamera,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCallMediaControls } from '@/features/calls/hooks/use-media';

interface CallControlsProps {
    onToggleFullScreen: () => void;
    myStream: MediaStream | null;

    DropdownMenungup?: () => void;
}

export function CallControls({ onToggleFullScreen, myStream }: CallControlsProps) {
    const {
        isMuted,
        isCameraEnabled,
        isOnHold,
        deviceInfo,
        toggleMic,
        toggleCamera,
        toggleHold,
        switchCamera,
    } = useCallMediaControls(myStream);

    return (
        <div className="flex justify-between sm:grid grid-cols-3 gap-2 border-t bg-background p-3">
            {/* Media controls */}
            <div className="flex gap-2">
                <Button
                    className="size-10"
                    variant={isCameraEnabled ? 'secondary' : 'destructive'}
                    disabled={!deviceInfo.hasCamera}
                    onClick={toggleCamera}
                >
                    {isCameraEnabled ? (
                        <Camera className="size-5" />
                    ) : (
                        <CameraOff className="size-5" />
                    )}
                </Button>

                <Button
                    className="size-10"
                    variant="secondary"
                    disabled={!deviceInfo.canSwitchCamera}
                    onClick={switchCamera}
                >
                    <SwitchCamera className="size-5" />
                </Button>

                <Button
                    className="size-10"
                    variant={isMuted ? 'destructive' : 'secondary'}
                    disabled={!deviceInfo.hasMic}
                    onClick={toggleMic}
                >
                    {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </Button>
            </div>

            {/* Call controls */}
            <div className="flex justify-center gap-2">
                <Button className="size-10" variant="destructive">
                    <PhoneOff className="size-5" />
                </Button>

                <Button
                    className="size-10"
                    variant={isOnHold ? 'default' : 'secondary'}
                    disabled={!myStream}
                    onClick={toggleHold}
                >
                    {isOnHold ? <Play className="size-5" /> : <Pause className="size-5" />}
                </Button>
            </div>

            {/* View controls */}
            <div className="flex justify-end gap-2">
                <Button className="size-10" variant="secondary" onClick={onToggleFullScreen}>
                    <Maximize className="size-5" />
                </Button>
            </div>
        </div>
    );
}
