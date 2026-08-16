'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    FileAudio,
    File as FileIcon,
    FileText,
    FileVideo,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCacheFile } from '../../file/files';
import { formatFileSize } from '../../file/utils';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message';
import { MessageScrollerItem } from '@/components/ui/message-scroller';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { getInitials } from '../../lib/utils-chat';
import { ChatFileMessage, ChatMessage } from '../../types/messages';
import { Room } from '../../types/room';
import { MessageFileContent } from './file-message';

type ChatFile = {
    fileId: string;
    originalFilename: string;
    mimeType: string;
    size: number;
};

function getKind(file: ChatFile): 'image' | 'video' | 'audio' | 'other' {
    if (file.mimeType.startsWith('image/')) return 'image';
    if (file.mimeType.startsWith('video/')) return 'video';
    if (file.mimeType.startsWith('audio/')) return 'audio';
    return 'other';
}

function FileIconFor({ file, className }: { file: ChatFile; className?: string }) {
    const kind = getKind(file);

    if (kind === 'video') return <FileVideo className={className} />;
    if (kind === 'audio') return <FileAudio className={className} />;
    if (file.mimeType === 'application/pdf' || file.mimeType.includes('text')) {
        return <FileText className={className} />;
    }

    return <FileIcon className={className} />;
}

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

export function FileGroupViewer({
    files,
    initialIndex = 0,
    onClose,
}: {
    files: ChatFile[];
    initialIndex?: number;
    onClose: () => void;
}) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [activeFile, setActiveFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);

    const attachment = files[activeIndex];
    const url = useFileUrl(activeFile);

    useEffect(() => {
        let cancelled = false;

        async function loadFile() {
            if (!attachment) return;

            setLoading(true);
            setActiveFile(null);

            try {
                const file = await getCacheFile(attachment.fileId);

                if (!cancelled) {
                    setActiveFile(file);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadFile();

        return () => {
            cancelled = true;
        };
    }, [attachment]);

    function previous() {
        setActiveIndex((index) => Math.max(0, index - 1));
    }

    function next() {
        setActiveIndex((index) => Math.min(files.length - 1, index + 1));
    }

    if (!attachment) return null;

    const kind = getKind(attachment);

    return (
        <div className="fixed inset-0 z-100 flex flex-col bg-background">
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{attachment.originalFilename}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)} · {activeIndex + 1} of {files.length}
                    </p>
                </div>

                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X />
                </Button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/30 p-6">
                {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

                {!loading && activeFile && url && kind === 'image' && (
                    <img
                        src={url}
                        alt={attachment.originalFilename}
                        className="max-h-full max-w-full rounded-md object-contain"
                    />
                )}

                {!loading && activeFile && url && kind === 'video' && (
                    <video src={url} controls className="max-h-full max-w-full rounded-md" />
                )}

                {!loading && activeFile && url && kind === 'audio' && (
                    <div className="flex flex-col items-center gap-6">
                        <FileIconFor
                            file={attachment}
                            className="h-20 w-20 text-muted-foreground"
                        />

                        <audio src={url} controls />
                    </div>
                )}

                {!loading && activeFile && !['image', 'video', 'audio'].includes(kind) && (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <FileIconFor
                            file={attachment}
                            className="h-20 w-20 text-muted-foreground"
                        />

                        <div>
                            <p className="font-medium">{attachment.originalFilename}</p>
                            <p className="text-sm text-muted-foreground">
                                {formatFileSize(attachment.size)}
                            </p>
                        </div>

                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary underline"
                            >
                                Open file
                            </a>
                        )}
                    </div>
                )}

                {files.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            disabled={activeIndex === 0}
                            onClick={previous}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
                        >
                            <ChevronLeft />
                        </Button>

                        <Button
                            variant="secondary"
                            size="icon"
                            disabled={activeIndex === files.length - 1}
                            onClick={next}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
                        >
                            <ChevronRight />
                        </Button>
                    </>
                )}
            </div>

            {files.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t p-3">
                    {files.map((file, index) => (
                        <button
                            key={file.fileId}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                'flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border',
                                index === activeIndex ? 'border-primary' : 'border-border',
                            )}
                        >
                            <FileIconFor file={file} className="h-6 w-6 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function MediaMessageGroup({
    messages,
    room,
    prevMessage,
}: {
    messages: ChatMessage[];
    room: Room;
    prevMessage?: ChatMessage;
}) {
    const firstMessage = messages[0];
    const isMine = firstMessage.isMine;
    const isSameSender = prevMessage?.sender?.id === firstMessage.sender?.id;
    const showAvatar = !isMine && room.isGroup && !isSameSender;

    return (
        <MessageScrollerItem messageId={firstMessage.id}>
            <Message align={isMine ? 'end' : 'start'}>
                {!isMine && room.isGroup && (
                    <div className="w-8 shrink-0">
                        {showAvatar && (
                            <MessageAvatar className="translate-0! self-start">
                                <Avatar>
                                    <AvatarImage src={firstMessage.sender.image ?? undefined} />
                                    <AvatarFallback className="text-[10px]">
                                        {getInitials(firstMessage.sender.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </MessageAvatar>
                        )}
                    </div>
                )}

                <MessageContent className="pb-0 gap-0">
                    <div
                        className={cn(
                            'grid max-w-sm grid-cols-2 gap-1 overflow-hidden rounded-xl',
                            isMine ? 'bg-primary' : 'bg-muted',
                        )}
                    >
                        {messages.map((message) => (
                            <GroupedMediaItem key={message.id} message={message} />
                        ))}
                    </div>

                    <div className="flex mt-0">
                        <span className="ml-auto text-[12px] font-light text-foreground/70">
                            {format(messages[messages.length - 1].sentAt, 'p').toLowerCase()}
                        </span>
                    </div>
                </MessageContent>
            </Message>
        </MessageScrollerItem>
    );
}

function GroupedMediaItem({ message }: { message: ChatFileMessage }) {
    
    return (

            <MessageFileContent
                isMine={message.isMine}
                sentAt={message.sentAt}
                attachment={message.attachment}
            />
    );
}
