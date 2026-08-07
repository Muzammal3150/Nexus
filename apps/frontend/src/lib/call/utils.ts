export function getMediaState(stream: MediaStream) {
    const audio = stream.getAudioTracks()[0];
    const video = stream.getVideoTracks()[0];

    return {
        mic: {
            exists: !!audio,
            enabled: audio?.enabled ?? false,
            readyState: audio?.readyState, // "live" | "ended"
            muted: audio?.muted ?? false,
        },
        camera: {
            exists: !!video,
            enabled: video?.enabled ?? false,
            readyState: video?.readyState,
            muted: video?.muted ?? false,
        },
    };
}
