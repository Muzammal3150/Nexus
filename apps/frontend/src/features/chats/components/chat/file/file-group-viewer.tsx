import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCacheFile } from '@/features/chats/file/files';
import { formatFileSize } from '@/features/chats/file/utils';
import { ChatFileMessage } from '@/features/chats/types/messages';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

function useFileUrl(file: File | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return url;
}

function getKind(mimeType: string): 'image' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'other';
}

export function FileGroupViewer({
    messages,
    initialIndex = 0,
    onClose,
}: {
    messages: ChatFileMessage[];
    initialIndex?: number;
    onClose: () => void;
}) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [activeFile, setActiveFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

    const activeMessage = messages[activeIndex];
    const url = useFileUrl(activeFile);

    useEffect(() => {
        setActiveIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        let cancelled = false;
        const urls: Record<string, string> = {};

        async function loadThumbnails() {
            await Promise.all(
                messages.map(async (message) => {
                    try {
                        const file = await getCacheFile(message.attachment.fileId);
                        urls[message.id] = URL.createObjectURL(file);
                    } catch {}
                }),
            );

            if (cancelled) {
                Object.values(urls).forEach(URL.revokeObjectURL);
                return;
            }

            setThumbnailUrls(urls);
        }

        loadThumbnails();

        return () => {
            cancelled = true;
            Object.values(urls).forEach(URL.revokeObjectURL);
        };
    }, [messages]);

    useEffect(() => {
        let cancelled = false;

        async function loadFile() {
            if (!activeMessage) return;

            setLoading(true);
            setActiveFile(null);

            try {
                const file = await getCacheFile(activeMessage.attachment.fileId);

                if (!cancelled) setActiveFile(file);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadFile();

        return () => {
            cancelled = true;
        };
    }, [activeMessage]);

    function previous() {
        setActiveIndex((index) => Math.max(0, index - 1));
    }

    function next() {
        setActiveIndex((index) => Math.min(messages.length - 1, index + 1));
    }

    if (!activeMessage) return null;

    const attachment = activeMessage.attachment;
    const kind = getKind(attachment.mimeType);

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex h-dvh w-dvw max-w-none flex-col gap-0 rounded-none border-0 p-0 sm:max-w-none">
                <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4 py-3">
                    <div className="min-w-0">
                        <DialogTitle className="truncate text-sm font-medium">
                            {attachment.originalFilename}
                        </DialogTitle>

                        <p className="text-xs text-muted-foreground">
                            {format(activeMessage.sentAt, 'MMM d, yyyy · h:mm a')} ·{' '}
                            {formatFileSize(attachment.size)} · {activeIndex + 1}/{messages.length}
                        </p>
                    </div>
                </DialogHeader>

                <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/30 p-6">
                    {loading && (
                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                            <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                            Loading...
                        </div>
                    )}

                    {!loading && activeFile && url && kind === 'image' && (
                        <img
                            src={url}
                            alt={attachment.originalFilename}
                            className="max-h-full max-w-full rounded-md object-contain"
                        />
                    )}

                    {!loading && activeFile && url && kind === 'video' && (
                        <video
                            src={url}
                            controls
                            autoPlay
                            playsInline
                            className="max-h-full max-w-full rounded-md"
                        />
                    )}

                    {!loading && activeFile && url && kind === 'audio' && (
                        <audio src={url} controls />
                    )}

                    {!loading && activeFile && url && kind === 'other' && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <p className="font-medium">{attachment.originalFilename}</p>

                            <p className="text-sm text-muted-foreground">
                                {formatFileSize(attachment.size)}
                            </p>

                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary underline"
                            >
                                Open file
                            </a>
                        </div>
                    )}

                    {messages.length > 1 && (
                        <>
                            <Button
                                variant="secondary"
                                size="icon"
                                disabled={activeIndex === 0}
                                onClick={previous}
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-md"
                            >
                                <ChevronLeft />
                            </Button>

                            <Button
                                variant="secondary"
                                size="icon"
                                disabled={activeIndex === messages.length - 1}
                                onClick={next}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-md"
                            >
                                <ChevronRight />
                            </Button>
                        </>
                    )}
                </div>

                {messages.length > 1 && (
                    <div className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t p-3">
                        {messages.map((message, index) => {
                            const thumbnailUrl = thumbnailUrls[message.id];
                            const thumbnailKind = getKind(message.attachment.mimeType);

                            return (
                                <button
                                    key={message.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={cn(
                                        'h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted transition-opacity',
                                        index === activeIndex
                                            ? 'border-primary'
                                            : 'border-border opacity-70 hover:opacity-100',
                                    )}
                                >
                                    {thumbnailUrl && thumbnailKind === 'image' && (
                                        <img
                                            src={thumbnailUrl}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    )}

                                    {thumbnailUrl && thumbnailKind === 'video' && (
                                        <video
                                            src={thumbnailUrl}
                                            muted
                                            playsInline
                                            preload="metadata"
                                            className="h-full w-full object-cover"
                                        />
                                    )}

                                    {thumbnailUrl && thumbnailKind === 'audio' && (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                            Audio
                                        </div>
                                    )}

                                    {!thumbnailUrl && (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                            ...
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
