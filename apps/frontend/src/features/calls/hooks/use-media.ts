import { useCallback, useEffect, useState } from 'react';

interface DeviceInfo {
    canSwitchCamera: boolean;
    hasCamera: boolean;
    hasMic: boolean;
}

interface CallMediaState {
    isMuted: boolean;
    isCameraEnabled: boolean;
    isOnHold: boolean;
    cameraFacing: 'user' | 'environment';
    deviceInfo: DeviceInfo;
}

interface UseCallMediaControlsReturn extends CallMediaState {
    toggleMic: () => void;
    toggleCamera: () => void;
    toggleHold: () => void;
    switchCamera: () => Promise<void>;
    refreshDevices: () => Promise<void>;
}

const defaultDeviceInfo: DeviceInfo = {
    canSwitchCamera: false,
    hasCamera: false,
    hasMic: false,
};

export function useCallMediaControls(
    stream: MediaStream | null,
): UseCallMediaControlsReturn {
    const [isOnHold, setIsOnHold] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>(
        'user',
    );
    const [deviceInfo, setDeviceInfo] =
        useState<DeviceInfo>(defaultDeviceInfo);

    const getAudioTrack = useCallback(() => {
        return stream?.getAudioTracks()[0] ?? null;
    }, [stream]);

    const getVideoTrack = useCallback(() => {
        return stream?.getVideoTracks()[0] ?? null;
    }, [stream]);

    const audioTrack = getAudioTrack();
    const videoTrack = getVideoTrack();

    const isMuted = audioTrack ? !audioTrack.enabled : true;
    const isCameraEnabled = videoTrack ? videoTrack.enabled : false;

    const refreshDevices = useCallback(async () => {
        if (!navigator.mediaDevices) {
            setDeviceInfo(defaultDeviceInfo);
            return;
        }

        try {
            const devices =
                await navigator.mediaDevices.enumerateDevices();

            const cameras = devices.filter(
                (device) => device.kind === 'videoinput',
            );

            const microphones = devices.filter(
                (device) => device.kind === 'audioinput',
            );

            setDeviceInfo({
                canSwitchCamera: cameras.length > 1,
                hasCamera: cameras.length > 0,
                hasMic: microphones.length > 0,
            });
        } catch {
            setDeviceInfo({
                canSwitchCamera: false,
                hasCamera: Boolean(videoTrack),
                hasMic: Boolean(audioTrack),
            });
        }
    }, [audioTrack, videoTrack]);

    useEffect(() => {
        refreshDevices();

        const handleDeviceChange = () => {
            refreshDevices();
        };

        navigator.mediaDevices?.addEventListener(
            'devicechange',
            handleDeviceChange,
        );

        return () => {
            navigator.mediaDevices?.removeEventListener(
                'devicechange',
                handleDeviceChange,
            );
        };
    }, [refreshDevices]);

    const toggleMic = useCallback(() => {
        const track = getAudioTrack();

        if (!track) return;

        track.enabled = !track.enabled;
    }, [getAudioTrack]);

    const toggleCamera = useCallback(() => {
        const track = getVideoTrack();

        if (!track) return;

        track.enabled = !track.enabled;
    }, [getVideoTrack]);

    const toggleHold = useCallback(() => {
        if (!stream) return;

        const nextHoldState = !isOnHold;

        stream.getTracks().forEach((track) => {
            track.enabled = !nextHoldState;
        });

        setIsOnHold(nextHoldState);
    }, [stream, isOnHold]);

    const switchCamera = useCallback(async () => {
        if (!stream || !deviceInfo.canSwitchCamera) return;

        const oldTrack = getVideoTrack();

        if (!oldTrack) return;

        const nextFacing =
            cameraFacing === 'user' ? 'environment' : 'user';

        try {
            const newStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: nextFacing,
                    },
                    audio: false,
                });

            const newTrack = newStream.getVideoTracks()[0];

            if (!newTrack) {
                newStream.getTracks().forEach((track) => track.stop());
                return;
            }

            stream.removeTrack(oldTrack);
            oldTrack.stop();

            stream.addTrack(newTrack);

            setCameraFacing(nextFacing);

            await refreshDevices();
        } catch (error) {
            console.error('Failed to switch camera:', error);
        }
    }, [
        stream,
        deviceInfo.canSwitchCamera,
        getVideoTrack,
        cameraFacing,
        refreshDevices,
    ]);

    // Reset hold state when the stream itself changes.
    useEffect(() => {
        setIsOnHold(false);
    }, [stream]);

    return {
        isMuted,
        isCameraEnabled,
        isOnHold,
        cameraFacing,
        deviceInfo,
        toggleMic,
        toggleCamera,
        toggleHold,
        switchCamera,
        refreshDevices,
    };
}


export async function getStream(isCamera: boolean, isMic: boolean) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: isCamera,
            audio: isMic,
        });

        return stream;
    } catch (err) {
        console.error(err);
        throw err;
    }
}