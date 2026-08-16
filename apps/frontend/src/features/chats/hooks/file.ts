import { db } from "@/db/db";
import { CachedFile } from "@/db/db.d";

import { useState, useEffect } from "react";

export function useCachedFile(fileId?: string) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (!fileId) {
            setFile(null);
            setLoading(false);
            setError(null);
            return;
        }

        setFile(null);
        setLoading(true);
        setError(null);

        db.files
            .get(fileId)
            .then((cachedFile: CachedFile | undefined) => {
                if (cancelled) return;

                if (!cachedFile) {
                    setError('File is no longer available locally.');
                    return;
                }

                if (!(cachedFile.file instanceof File)) {
                    setError('Cached file is invalid.');
                    return;
                }

                setFile(cachedFile.file);
            })
            .catch((error) => {
                if (cancelled) return;

                console.error('Failed to load cached file:', error);
                setError('Failed to load file.');
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [fileId]);

    return { file, loading, error };
}

export function useObjectUrl(file: File | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    return url;
}
