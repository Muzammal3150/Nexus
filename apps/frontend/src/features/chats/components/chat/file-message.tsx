import { AlertCircleIcon, Download, FileIcon, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';

import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
} from '@/components/ui/attachment';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { MessageContent, MessageFooter } from '@/components/ui/message';
import { db } from '@/db/db';
import { FileTransferStatus } from '@/db/db.d';
import { formatFileSize } from '../../file/utils';

const supportedImageTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/avif',
    'image/x-icon',
]);

const supportedVideoTypes = new Set(['video/mp4', 'video/webm', 'video/ogg']);

type MediaKind = 'image' | 'video' | 'other';

interface CachedFile {
    id: string;
    file: File;
}

interface FileAttachment {
    fileId: string;
    originalFilename: string;
    filename?: string;
    mimeType: string;
    size: number;
    status: FileTransferStatus;
    uploadProgress?: number;
    downloadProgress?: number;
    error?: string;
}

interface MessageFileContentProps {
    isMine: boolean;
    sentAt: number;
    attachment: FileAttachment;
}

function getMediaKind(mimeType?: string | null): MediaKind {
    if (!mimeType) return 'other';

    if (supportedImageTypes.has(mimeType)) {
        return 'image';
    }

    if (supportedVideoTypes.has(mimeType)) {
        return 'video';
    }

    return 'other';
}

function getTransferProgress(attachment: FileAttachment) {
    if (attachment.status === 'uploading') {
        return attachment.uploadProgress;
    }

    if (attachment.status === 'downloading') {
        return attachment.downloadProgress;
    }

    return undefined;
}

function useCachedFile(fileId?: string) {
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

function useObjectUrl(file: File | null) {
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

export function MessageFileContent({ isMine, sentAt, attachment }: MessageFileContentProps) {
    const mediaKind = useMemo(() => getMediaKind(attachment.mimeType), [attachment.mimeType]);

    const isComplete = attachment.status === 'uploaded' || attachment.status === 'downloaded';
    const shouldLoadPreview = isComplete && (mediaKind === 'image' || mediaKind === 'video');

    const { file, loading, error } = useCachedFile(
        shouldLoadPreview ? attachment.fileId : undefined,
    );

    const fileUrl = useObjectUrl(file);
    const progress = getTransferProgress(attachment);

    return (
        <MessageContent>
            <Bubble
                variant={isMine ? 'default' : 'muted'}
                className={getBubbleClassName(mediaKind, isComplete)}
            >
                <BubbleContent className="p-0 bg-transparent!">
                    <MessageAttachment
                        attachment={attachment}
                        mediaKind={mediaKind}
                        isComplete={isComplete}
                        shouldLoadPreview={shouldLoadPreview}
                        isLoading={loading}
                        error={error}
                        fileUrl={fileUrl}
                        progress={progress}
                    />
                </BubbleContent>
                <MessageTimestamp sentAt={sentAt} />
            </Bubble>
        </MessageContent>
    );
}

function getBubbleClassName(mediaKind: MediaKind, isComplete: boolean) {
    return mediaKind === 'other' || !isComplete ? 'p-0' : 'p-1';
}

interface MessageAttachmentProps {
    attachment: FileAttachment;
    mediaKind: MediaKind;
    isComplete: boolean;
    shouldLoadPreview: boolean;
    isLoading: boolean;
    error: string | null;
    fileUrl: string | null;
    progress?: number;
}

function MessageAttachment({
    attachment,
    mediaKind,
    isComplete,
    shouldLoadPreview,
    isLoading,
    error,
    fileUrl,
    progress,
}: MessageAttachmentProps) {
    if (attachment.status === 'failed') {
        return <ErrorAttachment attachment={attachment} />;
    }

    if (
        attachment.status === 'pending' ||
        attachment.status === 'uploading' ||
        attachment.status === 'downloading'
    ) {
        return <TransferringAttachment attachment={attachment} progress={progress} />;
    }

    if (shouldLoadPreview && isLoading) {
        return <PreviewLoading filename={attachment.originalFilename} />;
    }

    if (shouldLoadPreview && error) {
        return <PreviewError filename={attachment.originalFilename} error={error} />;
    }

    if (!isComplete) {
        return null;
    }

    if (mediaKind === 'image' && fileUrl) {
        return <ImagePreview url={fileUrl} filename={attachment.originalFilename} />;
    }

    if (mediaKind === 'video' && fileUrl) {
        return <VideoPreview url={fileUrl} filename={attachment.originalFilename} />;
    }

    if (mediaKind === 'other') {
        return <GenericFileAttachment attachment={attachment} />;
    }

    return null;
}

function MessageTimestamp({ sentAt }: { sentAt: number }) {
    return (
        <MessageFooter className="px-2 pb-1 text-[12px] text-right w-full text-muted-foreground">
            <span className='ml-auto'>{format(sentAt, 'p')}</span>
        </MessageFooter>
    );
}

function PreviewLoading({ filename }: { filename: string }) {
    return (
        <Attachment state="processing" className="w-full">
            <AttachmentMedia>
                <Loader2 className="size-5 animate-spin" />
            </AttachmentMedia>

            <AttachmentContent>
                <AttachmentTitle>{filename}</AttachmentTitle>
                <AttachmentDescription>Loading preview...</AttachmentDescription>
            </AttachmentContent>
        </Attachment>
    );
}

function PreviewError({ filename, error }: { filename: string; error: string }) {
    return (
        <Attachment state="error" className="w-full">
            <AttachmentMedia>
                <AlertCircleIcon className="size-5 text-destructive" />
            </AttachmentMedia>

            <AttachmentContent>
                <AttachmentTitle>{filename}</AttachmentTitle>
                <AttachmentDescription className="text-destructive">{error}</AttachmentDescription>
            </AttachmentContent>
        </Attachment>
    );
}

function ImagePreview({ url, filename }: { url: string; filename: string }) {
    return (
        <PreviewContainer>
            <img
                src={url}
                alt={filename}
                className="max-w-full max-h-80 rounded-md object-contain"
                loading="lazy"
            />

            <PreviewDownloadButton url={url} filename={filename} />
        </PreviewContainer>
    );
}

function VideoPreview({ url, filename }: { url: string; filename: string }) {
    return (
        <PreviewContainer>
            <video
                src={url}
                controls
                preload="metadata"
                className="max-w-full max-h-80 rounded-md"
            />

            <PreviewDownloadButton url={url} filename={filename} />
        </PreviewContainer>
    );
}

function PreviewContainer({ children }: { children: React.ReactNode }) {
    return <div className="relative group hover:bg-secondary">{children}</div>;
}

function PreviewDownloadButton({ url, filename }: { url: string; filename: string }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);

        try {
            const anchor = document.createElement('a');

            anchor.href = url;
            anchor.download = filename;

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label="Download"
            className="absolute top-2 right-2 rounded-full bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100"
        >
            {isDownloading ? (
                <Loader2 className="size-4 animate-spin text-white" />
            ) : (
                <Download className="size-4 text-white" />
            )}
        </button>
    );
}

function GenericFileAttachment({ attachment }: { attachment: FileAttachment }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        setIsDownloading(true);
        setError(null);

        try {
            const cachedFile = (await db.files.get(attachment.fileId)) as CachedFile | undefined;

            if (!cachedFile?.file) {
                throw new Error('File is no longer available locally.');
            }

            const url = URL.createObjectURL(cachedFile.file);
            const anchor = document.createElement('a');

            anchor.href = url;
            anchor.download = attachment.originalFilename || cachedFile.file.name;

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('File download failed:', error);

            setError(error instanceof Error ? error.message : 'Failed to download file.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Attachment state={error ? 'error' : 'idle'} className="w-full">
            <AttachmentMedia>
                {error ? (
                    <AlertCircleIcon className="size-5 text-destructive" />
                ) : (
                    <FileIcon className="size-5" />
                )}
            </AttachmentMedia>

            <AttachmentContent>
                <AttachmentTitle>{attachment.originalFilename}</AttachmentTitle>

                <AttachmentDescription className={error ? 'text-destructive' : undefined}>
                    {error ||
                        `${attachment.mimeType || 'File'} • ${formatFileSize(attachment.size)}`}
                </AttachmentDescription>
            </AttachmentContent>

            <AttachmentActions>
                <AttachmentAction
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    aria-label="Download"
                    className="mx-2 grid size-fit place-items-center p-2"
                >
                    {isDownloading ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <Download className="size-5" />
                    )}
                </AttachmentAction>
            </AttachmentActions>
        </Attachment>
    );
}

function TransferringAttachment({
    attachment,
    progress,
}: {
    attachment: FileAttachment;
    progress?: number;
}) {
    const label =
        attachment.status === 'uploading'
            ? 'Uploading'
            : attachment.status === 'downloading'
              ? 'Downloading'
              : 'Waiting';

    return (
        <Attachment state="uploading" className="w-full">
            <AttachmentMedia>
                <Loader2 className="size-5 animate-spin" />
            </AttachmentMedia>

            <AttachmentContent>
                <AttachmentTitle>{attachment.originalFilename}</AttachmentTitle>

                <AttachmentDescription>
                    {label}
                    {typeof progress === 'number' ? ` • ${Math.round(progress)}%` : '...'}
                </AttachmentDescription>

                {typeof progress === 'number' && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary transition-[width] duration-200"
                            style={{
                                width: `${Math.min(100, Math.max(0, progress))}%`,
                            }}
                        />
                    </div>
                )}
            </AttachmentContent>
        </Attachment>
    );
}

function ErrorAttachment({ attachment }: { attachment: FileAttachment }) {
    return (
        <Attachment state="error" className="w-full">
            <AttachmentMedia>
                <AlertCircleIcon className="size-5 text-destructive" />
            </AttachmentMedia>

            <AttachmentContent>
                <AttachmentTitle>{attachment.originalFilename}</AttachmentTitle>

                <AttachmentDescription className="text-destructive">
                    {attachment.error || 'Failed to transfer file'}
                </AttachmentDescription>
            </AttachmentContent>
        </Attachment>
    );
}
