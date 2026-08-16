'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message';
import { MessageScrollerItem } from '@/components/ui/message-scroller';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useCachedFile, useObjectUrl } from '../../hooks/file';
import { getInitials } from '../../lib/utils-chat';
import { ChatFileMessage, ChatMessage } from '../../types/messages';
import { Room } from '../../types/room';
import { FileGroupViewer } from './file/file-group-viewer';

function getKind(mimeType: string): 'image' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'other';
}

// export function FileGroupViewer({
//     messages,
//     initialIndex = 0,
//     onClose,
// }: {
//     messages: ChatFileMessage[];
//     initialIndex?: number;
//     onClose: () => void;
// }) {
//     const [activeIndex, setActiveIndex] = useState(initialIndex);
//     const [activeFile, setActiveFile] = useState<File | null>(null);
//     const [loading, setLoading] = useState(true);

//     const activeMessage = messages[activeIndex];
//     const url = useFileUrl(activeFile);

//     useEffect(() => {
//         let cancelled = false;

//         async function loadFile() {
//             if (!activeMessage) return;

//             setLoading(true);
//             setActiveFile(null);

//             try {
//                 const file = await getCacheFile(activeMessage.attachment.fileId);

//                 if (!cancelled) {
//                     setActiveFile(file);
//                 }
//             } finally {
//                 if (!cancelled) {
//                     setLoading(false);
//                 }
//             }
//         }

//         loadFile();

//         return () => {
//             cancelled = true;
//         };
//     }, [activeMessage]);

//     function previous() {
//         setActiveIndex((index) => Math.max(0, index - 1));
//     }

//     function next() {
//         setActiveIndex((index) => Math.min(messages.length - 1, index + 1));
//     }

//     if (!activeMessage) return null;

//     const kind = getKind(activeMessage.attachment.mimeType);

//     return (
//         <div className="fixed inset-0 z-100000000000000  top-0 left-0 flex flex-col w-dvw h-dvh bg-red-500">
//             <div className="flex items-center justify-between border-b px-4 py-3">
//                 <div className="min-w-0">
//                     <p className="truncate text-sm font-medium">
//                         {activeMessage.attachment.originalFilename}
//                     </p>
//                     <p className="text-xs text-muted-foreground">
//                         {formatFileSize(activeMessage.attachment.size)} · {activeIndex + 1} of{' '}
//                         {messages.length}
//                     </p>
//                 </div>

//                 <Button variant="ghost" size="icon" onClick={onClose}>
//                     <X />
//                 </Button>
//             </div>

//             <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/30 p-6">
//                 {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

//                 {!loading && activeFile && url && kind === 'image' && (
//                     <img
//                         src={url}
//                         alt={activeMessage.attachment.originalFilename}
//                         className="max-h-full max-w-full rounded-md object-contain"
//                     />
//                 )}

//                 {!loading && activeFile && url && kind === 'video' && (
//                     <video src={url} controls className="max-h-full max-w-full rounded-md" />
//                 )}

//                 {messages.length > 1 && (
//                     <>
//                         <Button
//                             variant="secondary"
//                             size="icon"
//                             disabled={activeIndex === 0}
//                             onClick={previous}
//                             className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
//                         >
//                             <ChevronLeft />
//                         </Button>

//                         <Button
//                             variant="secondary"
//                             size="icon"
//                             disabled={activeIndex === messages.length - 1}
//                             onClick={next}
//                             className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
//                         >
//                             <ChevronRight />
//                         </Button>
//                     </>
//                 )}
//             </div>

//             {messages.length > 1 && (
//                 <div className="flex gap-2 overflow-x-auto border-t p-3">
//                     {messages.map((message, index) => (
//                         <button
//                             key={message.id}
//                             onClick={() => setActiveIndex(index)}
//                             className={cn(
//                                 'flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border',
//                                 index === activeIndex ? 'border-primary' : 'border-border',
//                             )}
//                         >
//                             {/* <FileIconFor file={message.a} className="h-6 w-6 text-muted-foreground" /> */}
//                         </button>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

export function MediaMessageGroup({
    messages,
    room,
    prevMessage,
}: {
    messages: ChatMessage[];
    room: Room;
    prevMessage?: ChatMessage;
}) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const firstMessage = messages[0];
    const isMine = firstMessage.isMine;
    const isSameSender = prevMessage?.sender?.id === firstMessage.sender?.id;
    const showAvatar = !isMine && room.isGroup && !isSameSender;
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

                    <MessageContent
                        className={cn(
                            'max-w-md gap-2 rounded-lg pb-0 p-2',
                            isMine ? 'bg-primary/80' : 'bg-muted',
                        )}
                    >
                        {showAvatar && (
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
