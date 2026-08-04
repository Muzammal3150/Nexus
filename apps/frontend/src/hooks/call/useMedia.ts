


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