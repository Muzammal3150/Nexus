'use client';

import {
    Camera,
    CameraOff,
    EllipsisVertical,
    Maximize,
    Mic,
    MicOff,
    Pause,
    PhoneOff,
    Play,
    SwitchCamera,
    Volume2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';

interface CallControlsProps {
    onToggleFullScreen: () => void;
    myStream: MediaStream | null;
    remoteVideo?: HTMLVideoElement | null;
    onHangup?: () => void;
}

export function CallControls({
    onToggleFullScreen,
    myStream,
    remoteVideo,
    onHangup,
}: CallControlsProps) {
    const [volume, setVolume] = useState([80]);
    const [onHold, setOnHold] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

    const [deviceInfo, setDeviceInfo] = useState({
        canSwitchCamera: false,
        hasCamera: false,
        hasMic: false,
    });

    const audioTrack = myStream?.getAudioTracks()[0];
    const videoTrack = myStream?.getVideoTracks()[0];

    const muted = audioTrack ? !audioTrack.enabled : true;
    const cameraEnabled = videoTrack ? videoTrack.enabled : false;

    useEffect(() => {
        if (remoteVideo) {
            remoteVideo.volume = volume[0] / 100;
        }
    }, [remoteVideo, volume]);

    useEffect(() => {
        let mounted = true;

        const updateDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();

                const cameras = devices.filter((d) => d.kind === 'videoinput');

                const microphones = devices.filter((d) => d.kind === 'audioinput');

                if (!mounted) return;

                setDeviceInfo({
                    canSwitchCamera: cameras.length > 1,
                    hasCamera: cameras.length > 0,
                    hasMic: microphones.length > 0,
                });
            } catch {
                if (!mounted) return;

                setDeviceInfo({
                    canSwitchCamera: false,
                    hasCamera: !!videoTrack,
                    hasMic: !!audioTrack,
                });
            }
        };

        updateDevices();

        navigator.mediaDevices.addEventListener?.('devicechange', updateDevices);

        return () => {
            mounted = false;

            navigator.mediaDevices.removeEventListener?.('devicechange', updateDevices);
        };
    }, [audioTrack, videoTrack]);

    const toggleMic = () => {
        if (!audioTrack) return;
        audioTrack.enabled = !audioTrack.enabled;
    };

    const toggleCamera = () => {
        if (!videoTrack) return;
        videoTrack.enabled = !videoTrack.enabled;
    };

    const toggleHold = () => {
        if (!myStream) return;

        const hold = !onHold;
        myStream.getTracks().forEach((track) => {
            track.enabled = !hold;
        });

        setOnHold(hold);
    };

    const switchCamera = async () => {
        if (!myStream || !deviceInfo.canSwitchCamera) return;

        try {
            const facing = cameraFacing === 'user' ? 'environment' : 'user';

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                },
                audio: false,
            });

            const newTrack = newStream.getVideoTracks()[0];
            const oldTrack = myStream.getVideoTracks()[0];

            if (!newTrack || !oldTrack) return;

            myStream.removeTrack(oldTrack);
            oldTrack.stop();
            myStream.addTrack(newTrack);

            setCameraFacing(facing);

            // If using WebRTC:
            //
            // peerConnection
            //     .getSenders()
            //     .find(s => s.track?.kind === 'video')
            //     ?.replaceTrack(newTrack);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-2 border-t bg-background p-3">
            <div className="flex gap-2">
                <Button
                    className="size-10"
                    variant={cameraEnabled ? 'secondary' : 'destructive'}
                    disabled={!deviceInfo.hasCamera}
                    onClick={toggleCamera}
                >
                    {cameraEnabled ? (
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
                    variant={muted ? 'destructive' : 'secondary'}
                    disabled={!deviceInfo.hasMic}
                    onClick={toggleMic}
                >
                    {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </Button>

                <div className="flex w-40 items-center gap-2 px-2">
                    <Volume2 className="size-4 text-muted-foreground" />

                    <Slider value={volume} onValueChange={setVolume} min={0} max={100} step={1} />
                </div>
            </div>

            <div className="flex justify-center gap-2">
                <Button className="size-10" variant="destructive" onClick={onHangup}>
                    <PhoneOff />
                </Button>

                <Button
                    className="size-10"
                    variant={onHold ? 'default' : 'secondary'}
                    disabled={!myStream}
                    onClick={toggleHold}
                >
                    {onHold ? <Play className="size-5" /> : <Pause className="size-5" />}
                </Button>
            </div>

            <div className="flex justify-end gap-2">
                <Button className="size-10" variant="secondary" onClick={onToggleFullScreen}>
                    <Maximize className="size-5" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="secondary" className="size-10" />}
                    >
                        <EllipsisVertical />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                        <DropdownMenuGroup>
                            <DropdownMenuItem disabled={!deviceInfo.hasMic}>
                                {muted ? 'Microphone: Muted' : 'Microphone: On'}
                            </DropdownMenuItem>

                            <DropdownMenuItem disabled={!deviceInfo.hasCamera}>
                                {cameraEnabled ? 'Camera: On' : 'Camera: Off'}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                disabled={!deviceInfo.canSwitchCamera}
                                onClick={switchCamera}
                            >
                                Switch Camera
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem disabled={!deviceInfo.hasMic} onClick={toggleMic}>
                                Toggle Microphone
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                disabled={!deviceInfo.hasCamera}
                                onClick={toggleCamera}
                            >
                                Toggle Camera
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={toggleHold}>
                                {onHold ? 'Resume Call' : 'Hold Call'}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
