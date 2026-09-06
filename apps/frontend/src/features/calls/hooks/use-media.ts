import { useCallback, useEffect, useRef, useState } from "react";

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

    // Remembers what mic/camera looked like right before hold was engaged,
    // so resuming restores the user's actual choice instead of force-enabling everything.
    const preHoldStateRef = useRef<{ micEnabled: boolean; cameraEnabled: boolean } | null>(null);

    const refreshDevices = useCallback(async () => {
        if (!navigator.mediaDevices?.enumerateDevices) {
            setDeviceInfo({
                hasCamera: !!stream?.getVideoTracks().length,
                hasMic: !!stream?.getAudioTracks().length,
                canSwitchCamera: false,
            });
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
        } catch (error) {
            console.error("Failed to enumerate devices:", error);
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
        preHoldStateRef.current = null;
    }, [stream, syncTrackState]);

    // Keep state in sync if a track ends unexpectedly (device unplugged, permission
    // revoked, remote party closes it, etc.) instead of silently going stale.
    useEffect(() => {
        if (!stream) return;

        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];

        const handleAudioEnded = () => setIsMuted(true);
        const handleVideoEnded = () => setIsCameraEnabled(false);

        audioTrack?.addEventListener("ended", handleAudioEnded);
        videoTrack?.addEventListener("ended", handleVideoEnded);

        return () => {
            audioTrack?.removeEventListener("ended", handleAudioEnded);
            videoTrack?.removeEventListener("ended", handleVideoEnded);
        };
    }, [stream]);

    useEffect(() => {
        refreshDevices();

        const handleDeviceChange = () => refreshDevices();

        navigator.mediaDevices?.addEventListener("devicechange", handleDeviceChange);

        return () => {
            navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
        };
    }, [refreshDevices]);

    const toggleMic = useCallback(() => {
        // Toggling the raw track while on hold would desync isOnHold from
        // actual track state, so route mic/camera changes through hold logic instead.
        if (isOnHold) return;

        const track = stream?.getAudioTracks()[0];

        if (!track) return;

        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
    }, [stream, isOnHold]);

    const toggleCamera = useCallback(() => {
        if (isOnHold) return;

        const track = stream?.getVideoTracks()[0];

        if (!track) return;

        track.enabled = !track.enabled;
        setIsCameraEnabled(track.enabled);
    }, [stream, isOnHold]);

    const toggleHold = useCallback(() => {
        if (!stream) return;

        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        const nextHold = !isOnHold;

        if (nextHold) {
            // Entering hold: remember actual per-track state, then mute everything.
            preHoldStateRef.current = {
                micEnabled: audioTrack?.enabled ?? false,
                cameraEnabled: videoTrack?.enabled ?? false,
            };

            if (audioTrack) audioTrack.enabled = false;
            if (videoTrack) videoTrack.enabled = false;

            setIsOnHold(true);
            setIsMuted(true);
            setIsCameraEnabled(false);
        } else {
            // Resuming: restore exactly what the user had before hold, don't
            // force everything back on (e.g. a user who was already muted
            // should stay muted after resuming).
            const restore = preHoldStateRef.current ?? {
                micEnabled: !!audioTrack?.enabled,
                cameraEnabled: !!videoTrack?.enabled,
            };

            if (audioTrack) audioTrack.enabled = restore.micEnabled;
            if (videoTrack) videoTrack.enabled = restore.cameraEnabled;

            preHoldStateRef.current = null;
            setIsOnHold(false);
            setIsMuted(!restore.micEnabled);
            setIsCameraEnabled(restore.cameraEnabled);
        }
    }, [stream, isOnHold]);

    const switchCamera = useCallback(async () => {
        if (!stream || !deviceInfo.canSwitchCamera) return;

        const oldTrack = stream.getVideoTracks()[0];

        if (!oldTrack) return;

        const nextFacing = cameraFacing === "user" ? "environment" : "user";
        const wasEnabled = oldTrack.enabled;

        let newStream: MediaStream | null = null;

        try {
            newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: nextFacing },
                audio: false,
            });

            const newTrack = newStream.getVideoTracks()[0];

            if (!newTrack) {
                newStream.getTracks().forEach((track) => track.stop());
                return;
            }

            newTrack.enabled = wasEnabled;
            stream.addTrack(newTrack);
            // Only remove/stop the old track once the new one is confirmed working,
            // so a mid-swap failure doesn't leave the call with no video track at all.
            stream.removeTrack(oldTrack);
            oldTrack.stop();

            // Stop any extra tracks getUserMedia may have handed back beyond the video track.
            newStream.getTracks().forEach((track) => {
                if (track !== newTrack) track.stop();
            });

            setCameraFacing(nextFacing);
            setIsCameraEnabled(newTrack.enabled);
            await refreshDevices();
        } catch (error) {
            console.error("Failed to switch camera:", error);
            // Clean up anything we managed to acquire before the failure.
            newStream?.getTracks().forEach((track) => track.stop());
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