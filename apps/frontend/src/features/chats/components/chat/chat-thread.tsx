'use client';

import React from 'react';
import { format } from 'date-fns';
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
import { MessageFileContent } from './file-message';
import { MediaMessageGroup } from './FileGroup';

interface ChatThreadProps {
    messages?: Partial<Record<string, ChatMessage[]>>;
    className?: string;
    room: Room;
}

export function ChatThread({ messages, className, room }: ChatThreadProps) {
    return (
        <MessageScroller className="bg-muted/20">
            <MessageScrollerViewport>
                <MessageScrollerContent className={cn('flex flex-col gap-2 px-6 py-4', className)}>
                    {Object.entries(messages ?? {}).map(([day, dayMessages]) => (
                        <React.Fragment key={day}>
                            <Marker variant="separator" className="py-4">
                                <MarkerContent>{day}</MarkerContent>
                            </Marker>
                            {dayMessages && renderMessages(dayMessages, room)}
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
    prevMessage,
    room,
}: {
    message: ChatMessage;
    prevMessage?: ChatMessage;
    room: Room;
}) {
    const sameSender = prevMessage?.sender?.id === message.sender?.id;
    const showSender = !message.isMine && room.isGroup && !sameSender;

    return (
        <MessageScrollerItem messageId={message.id}>
            <Message align={message.isMine ? 'end' : 'start'}>
                {!message.isMine && room.isGroup && (
                    <div className="w-8 shrink-0">
                        {showSender && (
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
                    <MessageTextContent message={message} showSender={showSender} />
                ) : (
                    <MessageFileContent
                        isMine={message.isMine}
                        sentAt={message.sentAt}
                        attachment={message.attachment}
                        showSender={showSender}
                        sender={message.sender}
                    />
                )}
            </Message>
        </MessageScrollerItem>
    );
}

function MessageTextContent({
    message,
    showSender,
}: {
    message: Extract<ChatMessage, { type: 'text' }>;
    showSender: boolean;
}) {
    return (
        <MessageContent className="gap-0 pb-0">
            <Bubble variant={message.isMine ? 'default' : 'muted'}>
                <BubbleContent>
                    {showSender && (
                        <div className="px-1 pt-0.5 text-[13px] font-semibold text-primary">
                            {message.sender.name}
                        </div>
                    )}
                    <div>{message.text}</div>
                    <div className="mt-0 flex">
                        <span className="relative ml-auto text-right text-[12px] font-light text-foreground/70">
                            {format(message.sentAt, 'p').toLowerCase()}
                        </span>
                    </div>
                </BubbleContent>
            </Bubble>
        </MessageContent>
    );
}

function renderMessages(messages: ChatMessage[], room: Room) {
    const result: React.ReactNode[] = [];

    for (let i = 0; i < messages.length; ) {
        const message = messages[i];

        if (isGroupableMedia(message)) {
            const group = getMediaGroup(messages, i);

            if (group.length > 4) {
                result.push(
                    <MediaMessageGroup
                        key={message.id}
                        messages={group}
                        room={room}
                        prevMessage={messages[i - 1]}
                    />,
                );
                i += group.length;
                continue;
            }
        }

        result.push(
            <MessageItem
                key={message.id}
                message={message}
                prevMessage={messages[i - 1]}
                room={room}
            />,
        );

        i++;
    }

    return result;
}

function getMediaGroup(messages: ChatMessage[], start: number) {
    const first = messages[start];
    if (!first || !isGroupableMedia(first)) return [];

    const group = [first];

    for (let i = start + 1; i < messages.length; i++) {
        const message = messages[i];
        if (!isGroupableMedia(message) || message.sender?.id !== first.sender?.id) break;
        group.push(message);
    }

    return group;
}

function isGroupableMedia(message: ChatMessage) {
    return message.type === 'file' && /^(image|video)\//.test(message.attachment.mimeType);
}
