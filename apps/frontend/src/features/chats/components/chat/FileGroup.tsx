'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message';
import { MessageScrollerItem } from '@/components/ui/message-scroller';
import { cn, getUpload } from '@/lib/utils';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useCachedFile, useObjectUrl } from '../../hooks/file';
import { getInitials } from '../../lib/utils-chat';
import { ChatFileMessage } from '../../types/messages';
import { Room } from '../../types/room';
import { FileGroupViewer } from './file/file-group-viewer';

function getKind(mimeType: string): 'image' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'other';
}

export function MediaMessageGroup({
    messages,
    room,
    showSender,
}: {
    messages: ChatFileMessage[];
    room: Room;
    showSender: boolean;
}) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const firstMessage = messages[0];
    const isMine = firstMessage.isMine;

    const visibleMessages = messages.slice(0, 4);
    const extraCount = messages.length - 4;

    const openViewer = (index: number) => {
        setActiveIndex(index);
        setViewerOpen(true);
    };

    return (
        <>
            <MessageScrollerItem messageId={firstMessage.id}>
                <Message align={isMine ? 'end' : 'start'}>
                    {!isMine && room.isGroup && (
                        <div className="w-8 shrink-0">
                            {showSender && (
                                <MessageAvatar className="translate-0! self-start">
                                    <Avatar>
                                        <AvatarImage src={getUpload(firstMessage.sender.image)} />
                                        <AvatarFallback className="text-[10px]">
                                            {getInitials(firstMessage.sender.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </MessageAvatar>
                            )}
                        </div>
                    )}

                    <MessageContent
                        className={cn(
                            'max-w-md gap-2 rounded-lg pb-0 p-2',
                            isMine ? 'bg-primary/80' : 'bg-muted',
                        )}
                    >
                        {showSender && (
                            <div className="px-1 pt-0.5 text-[13px] font-semibold text-primary">
                                {firstMessage.sender.name}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl">
                            {visibleMessages.map((message, index) => {
                                const isLast = index === 3;
                                const hasMore = extraCount > 0;

                                return (
                                    <div
                                        key={message.id}
                                        className="relative cursor-pointer"
                                        onClick={() => openViewer(index)}
                                    >
                                        <GroupedMediaItem message={message as ChatFileMessage} />

                                        {isLast && hasMore && (
                                            <div
                                                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/70 text-2xl font-semibold text-white"
                                                onClick={() => setViewerOpen(true)}
                                            >
                                                +{extraCount}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-0 flex">
                            <span className="ml-auto mr-2 text-[12px] font-light text-foreground/70">
                                {format(messages.at(-1)!.sentAt, 'p').toLowerCase()}
                            </span>
                        </div>
                    </MessageContent>
                </Message>
            </MessageScrollerItem>

            {viewerOpen && (
                <FileGroupViewer
                    messages={messages as ChatFileMessage[]}
                    initialIndex={activeIndex}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </>
    );
}

function GroupedMediaItem({ message }: { message: ChatFileMessage }) {
    const mediaKind = useMemo(
        () => getKind(message.attachment.mimeType),
        [message.attachment.mimeType],
    );

    const isComplete =
        message.attachment.status === 'uploaded' || message.attachment.status === 'downloaded';
    const shouldLoadPreview = isComplete && (mediaKind === 'image' || mediaKind === 'video');

    const { file, loading, error } = useCachedFile(
        shouldLoadPreview ? message.attachment.fileId : undefined,
    );
    const fileUrl = useObjectUrl(file);

    if (!shouldLoadPreview) {
        return <div className="aspect-square rounded-lg bg-black" />;
    }

    return (
        <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
            {fileUrl && mediaKind === 'image' && (
                <img src={fileUrl} alt="" className="h-full w-full object-cover" />
            )}

            {fileUrl && mediaKind === 'video' && (
                <video
                    src={fileUrl}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                />
            )}

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
            )}

            {error && !loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
                    Failed to load
                </div>
            )}
        </div>
    );
}
