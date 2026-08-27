import { useCallback, useEffect, useState } from "react";

interface DeviceInfo {
    canSwitchCamera: boolean;
    hasCamera: boolean;
    hasMic: boolean;
}

interface CallMediaState {
    isMuted: boolean;
    isCameraEnabled: boolean;
    isOnHold: boolean;
    cameraFacing: "user" | "environment";
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

export function useCallMediaControls(stream: MediaStream | null): UseCallMediaControlsReturn {
    const [isMuted, setIsMuted] = useState(true);
    const [isCameraEnabled, setIsCameraEnabled] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(defaultDeviceInfo);

    const refreshDevices = useCallback(async () => {
        if (!navigator.mediaDevices) {
            setDeviceInfo(defaultDeviceInfo);
            return;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some((device) => device.kind === "videoinput");
            const hasMic = devices.some((device) => device.kind === "audioinput");
            const cameraCount = devices.filter((device) => device.kind === "videoinput").length;

            setDeviceInfo({
                hasCamera,
                hasMic,
                canSwitchCamera: cameraCount > 1,
            });
        } catch {
            setDeviceInfo({
                hasCamera: !!stream?.getVideoTracks().length,
                hasMic: !!stream?.getAudioTracks().length,
                canSwitchCamera: false,
            });
        }
    }, [stream]);

    const syncTrackState = useCallback(() => {
        const audioTrack = stream?.getAudioTracks()[0];
        const videoTrack = stream?.getVideoTracks()[0];

        setIsMuted(audioTrack ? !audioTrack.enabled : true);
        setIsCameraEnabled(videoTrack?.enabled ?? false);
    }, [stream]);

    useEffect(() => {
        syncTrackState();
        setIsOnHold(false);
    }, [stream, syncTrackState]);

    useEffect(() => {
        refreshDevices();

        const handleDeviceChange = () => refreshDevices();

        navigator.mediaDevices?.addEventListener("devicechange", handleDeviceChange);

        return () => {
            navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
        };
    }, [refreshDevices]);

    const toggleMic = useCallback(() => {
        const track = stream?.getAudioTracks()[0];

        if (!track) return;

        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
    }, [stream]);

    const toggleCamera = useCallback(() => {
        const track = stream?.getVideoTracks()[0];

        if (!track) return;

        track.enabled = !track.enabled;
        setIsCameraEnabled(track.enabled);
    }, [stream]);

    const toggleHold = useCallback(() => {
        if (!stream) return;

        const nextHold = !isOnHold;

        stream.getTracks().forEach((track) => {
            track.enabled = !nextHold;
        });

        setIsOnHold(nextHold);
        setIsMuted(nextHold || !stream.getAudioTracks()[0]?.enabled);
        setIsCameraEnabled(!nextHold && !!stream.getVideoTracks()[0]?.enabled);
    }, [stream, isOnHold]);

    const switchCamera = useCallback(async () => {
        if (!stream || !deviceInfo.canSwitchCamera) return;

        const oldTrack = stream.getVideoTracks()[0];

        if (!oldTrack) return;

        const nextFacing = cameraFacing === "user" ? "environment" : "user";

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: nextFacing },
                audio: false,
            });

            const newTrack = newStream.getVideoTracks()[0];

            if (!newTrack) {
                newStream.getTracks().forEach((track) => track.stop());
                return;
            }

            newTrack.enabled = oldTrack.enabled;
            stream.removeTrack(oldTrack);
            stream.addTrack(newTrack);
            oldTrack.stop();

            setCameraFacing(nextFacing);
            setIsCameraEnabled(newTrack.enabled);
            await refreshDevices();
        } catch (error) {
            console.error("Failed to switch camera:", error);
        }
    }, [stream, deviceInfo.canSwitchCamera, cameraFacing, refreshDevices]);

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

export async function getStream(isCamera: boolean, isMic: boolean): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Media devices are not supported");
    }

    return navigator.mediaDevices.getUserMedia({
        video: isCamera,
        audio: isMic,
    });
}