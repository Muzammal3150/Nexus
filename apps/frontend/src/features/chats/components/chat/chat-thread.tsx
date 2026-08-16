'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message';
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { getInitials } from '@/features/chats/lib/utils-chat';
import { ChatMessage } from '@/features/chats/types/messages';
import { Room } from '@/features/chats/types/room';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import React from 'react';
import { MessageFileContent } from './file-message';
import { MediaMessageGroup } from './FileGroup';

interface ChatThreadProps {
    messages?: Partial<Record<string, ChatMessage[]>>;
    className?: string;
    room: Room;
}

// function StatusIcon({ status }: { status?: ChatMessage['status'] }) {
//     if (status === 'read') {
//         return <CheckCheck className="size-3.5 text-primary" />;
//     }
//     if (status === 'delivered') {
//         return <CheckCheck className="size-3.5" />;
//     }
//     if (status === 'sent') {
//         return <Check className="size-3.5" />;
//     }
//     return null;
// }

export function ChatThread({ messages, className, room }: ChatThreadProps) {
    return (
        <MessageScroller className=" bg-muted/20  ">
            <MessageScrollerViewport>
                <MessageScrollerContent className={cn('flex flex-col gap-1 px-6 py-4', className)}>
                    {messages &&
                        Object.keys(messages).map((day) => (
                            <React.Fragment key={day}>
                                <Marker variant="separator" className="py-4">
                                    <MarkerContent>{day}</MarkerContent>
                                </Marker>

                                {messages[day] && renderDayMessages(messages[day], room)}
                            </React.Fragment>
                        ))}
                </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
        </MessageScroller>
    );
}
function MessageItem({
    message,
    room,
    prevMessage,
}: {
    message: ChatMessage;
    prevMessage?: ChatMessage;
    room: Room;
}) {
    // console.log(message)
    const isSameSender = prevMessage?.sender?.id === message.sender?.id;

    const showAvatar = !message.isMine && room.isGroup && !isSameSender;

    return (
        <MessageScrollerItem messageId={message.id}>
            <Message align={message.isMine ? 'end' : 'start'}>
                {!message.isMine && room.isGroup && (
                    <div className="w-8 shrink-0">
                        {showAvatar && (
                            <MessageAvatar className="translate-0! self-start">
                                <Avatar>
                                    <AvatarImage src={message.sender.image ?? undefined} />
                                    <AvatarFallback className="text-[10px]">
                                        {getInitials(message.sender.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </MessageAvatar>
                        )}
                    </div>
                )}

                {message.type === 'text' ? (
                    <MessageTextContent
                        text={message.text}
                        isMine={message.isMine}
                        sentAt={message.sentAt}
                    />
                ) : (
                    <MessageFileContent
                        isMine={message.isMine}
                        sentAt={message.sentAt}
                        attachment={message.attachment}
                    />
                )}
            </Message>
        </MessageScrollerItem>
    );
}
function MessageTextContent({
    text,
    isMine,
    sentAt,
}: {
    text: string;
    isMine: boolean;
    sentAt: number;
}) {
    return (
        <MessageContent className="pb-0 gap-0 ">
            <Bubble variant={isMine ? 'default' : 'muted'} className="">
                <BubbleContent className="">
                    <div className="">{text}</div>
                    <div className="flex mt-0">
                        <span className="text-[12px] font-light text-right ml-auto text-foreground/70 relative">
                            {format(sentAt, 'p').toLowerCase()}
                        </span>
                    </div>
                </BubbleContent>
            </Bubble>
            {/* <MessageFooter className=" text-muted-foreground">
                {isMine && <StatusIcon status={message.status} />}
            </MessageFooter> */}
        </MessageContent>
    );
}

function renderDayMessages(messages: ChatMessage[], room: Room) {
    const result: React.ReactNode[] = [];

    let i = 0;

    while (i < messages.length) {
        const message = messages[i];

        if (isGroupableMedia(message)) {
            const group = [message];
            let j = i + 1;

            while (
                j < messages.length &&
                isGroupableMedia(messages[j]) &&
                messages[j].sender?.id === message.sender?.id
            ) {
                group.push(messages[j]);
                j++;
            }

            if (group.length > 4) {
                result.push(
                    <MediaMessageGroup
                        key={message.id}
                        messages={group}
                        room={room}
                        prevMessage={i > 0 ? messages[i - 1] : undefined}
                    />,
                );
                i = j;
                continue;
            }
        }

        result.push(
            <MessageItem
                key={message.id}
                message={message}
                prevMessage={i > 0 ? messages[i - 1] : undefined}
                room={room}
            />,
        );

        i++;
    }

    return result;
}

function isGroupableMedia(message: ChatMessage) {
    if (message.type !== 'file') return false;

    return (
        message.attachment.mimeType.startsWith('image/') ||
        message.attachment.mimeType.startsWith('video/')
    );
}
