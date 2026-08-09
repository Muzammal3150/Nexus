import { AlertCircleIcon, Download, FileIcon, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
import { formatFileSize } from '@/lib/chat/file/utils';
import { format } from 'date-fns';

const SUPPORTED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/avif',
    'image/x-icon',
]);

const SUPPORTED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/ogg']);

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

function getMediaKind(mimeType: string | undefined | null): MediaKind {
    if (!mimeType) return 'other';

    if (SUPPORTED_IMAGE_TYPES.has(mimeType)) {
        return 'image';
    }

    if (SUPPORTED_VIDEO_TYPES.has(mimeType)) {
        return 'video';
    }

    return 'other';
}

function useCachedFile(fileId: string | undefined) {
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
        console.log(fileId)
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

    return {
        file,
        loading,
        error,
    };
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

    const isUploading = attachment.status === 'uploading';
    const isDownloading = attachment.status === 'downloading';
    const isPending = attachment.status === 'pending';
    const isFailed = attachment.status === 'failed';
    const isUploaded = attachment.status === 'uploaded';

    /*
     * Only previewable files are loaded from IndexedDB automatically.
     *
     * Generic files such as PDF, ZIP, DOCX, etc. stay untouched
     * until the user clicks Download.
     */
    const shouldLoadPreview = isUploaded && (mediaKind === 'image' || mediaKind === 'video');

    const {
        file: cachedFile,
        loading: isLoadingFile,
        error: fileError,
    } = useCachedFile(shouldLoadPreview ? attachment.fileId : undefined);

    const fileUrl = useObjectUrl(cachedFile);

    const progress = isUploading
        ? attachment.uploadProgress
        : isDownloading
          ? attachment.downloadProgress
          : undefined;

    if (isFailed) {
        return (
            <MessageContent>
                <Bubble variant={isMine ? 'default' : 'muted'} className="p-0">
                    <BubbleContent className="p-0">
                        <ErrorAttachment attachment={attachment} />
                    </BubbleContent>
                </Bubble>

                <MessageFooter className="text-[11px] text-muted-foreground">
                    <span>{format(sentAt, 'p')}</span>
                </MessageFooter>
            </MessageContent>
        );
    }

    return (
        <MessageContent>
            <Bubble
                variant={isMine ? 'default' : 'muted'}
                className={mediaKind === 'other' || !isUploaded ? 'p-0' : 'p-1'}
            >
                <BubbleContent className="p-0">
                    {(isPending || isUploading || isDownloading) && (
                        <TransferringAttachment attachment={attachment} progress={progress} />
                    )}

                    {isUploaded && shouldLoadPreview && isLoadingFile && (
                        <PreviewLoading filename={attachment.originalFilename} />
                    )}

                    {isUploaded && shouldLoadPreview && fileError && (
                        <PreviewError filename={attachment.originalFilename} error={fileError} />
                    )}

                    {isUploaded && mediaKind === 'image' && fileUrl && (
                        <ImagePreview url={fileUrl} filename={attachment.originalFilename} />
                    )}

                    {isUploaded && mediaKind === 'video' && fileUrl && (
                        <VideoPreview url={fileUrl} filename={attachment.originalFilename} />
                    )}

                    {isUploaded && mediaKind === 'other' && (
                        <GenericFileAttachment attachment={attachment} />
                    )}
                </BubbleContent>
            </Bubble>

            <MessageFooter className="text-[11px] text-muted-foreground">
                <span>{format(sentAt, 'p')}</span>
            </MessageFooter>
        </MessageContent>
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
        <div className="relative group">
            <img
                src={url}
                alt={filename}
                className="max-w-full max-h-80 rounded-md object-contain"
                loading="lazy"
            />

            <PreviewDownloadButton url={url} filename={filename} />
        </div>
    );
}

function VideoPreview({ url, filename }: { url: string; filename: string }) {
    return (
        <div className="relative group">
            <video
                src={url}
                controls
                preload="metadata"
                className="max-w-full max-h-80 rounded-md"
            />

            <PreviewDownloadButton url={url} filename={filename} />
        </div>
    );
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
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2"
        >
            {isDownloading ? (
                <Loader2 className="size-4 text-white animate-spin" />
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
            /*
             * This is intentionally the FIRST IndexedDB read
             * for non-previewable files.
             */
            const cachedFile = (await db.files.get(attachment.fileId)) as CachedFile | undefined;
            console.log(cachedFile, attachment.fileId);
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

            /*
             * Don't revoke immediately. Give the browser time
             * to start the download.
             */
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
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
                    className="p-2 size-fit mx-2 grid place-items-center"
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
    let label = 'Waiting';

    if (attachment.status === 'uploading') {
        label = 'Uploading';
    } else if (attachment.status === 'downloading') {
        label = 'Downloading';
    }

    return (
        <Attachment state="loading" className="w-full">
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
                    <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
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
