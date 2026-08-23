'use client';

import { Marker, MarkerContent } from '@/components/ui/marker';
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { ChatFileMessage, ChatMessage } from '@/features/chats/types/messages';
import { Room } from '@/features/chats/types/room';
import { cn } from '@/lib/utils';
import React from 'react';
import { MediaMessageGroup } from './FileGroup';
import { SystemMessageItem, MessageItem } from './message-item';

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

function renderMessages(messages: ChatMessage[], room: Room): React.ReactNode[] {
    const result: React.ReactNode[] = [];

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];

        if (message.type === 'system') {
            result.push(<SystemMessageItem key={message.id} message={message} />);
            continue;
        }

        const prevMessage = i > 0 ? messages[i - 1] : undefined;
        const sameSender = prevMessage?.sender?.id === message.sender?.id;
        const showSender = !message.isMine && room.isGroup && !sameSender;

        if (isGroupableMedia(message)) {
            const group = getMediaGroup(messages, i);

            if (group.length > 4) {
                result.push(
                    <MediaMessageGroup
                        key={message.id}
                        messages={group}
                        room={room}
                        showSender={showSender}
                    />,
                );

                i += group.length - 1;
                continue;
            }
        }

        result.push(
            <MessageItem key={message.id} message={message} showSender={showSender} room={room} />,
        );
    }

    return result;
}
function getMediaGroup(messages: ChatMessage[], start: number): ChatFileMessage[] {
    const first = messages[start];

    if (!first || !isGroupableMedia(first)) {
        return [];
    }

    const group: ChatFileMessage[] = [first];

    for (let i = start + 1; i < messages.length; i++) {
        const message = messages[i];

        if (!message || !isGroupableMedia(message) || message.sender?.id !== first.sender?.id) {
            break;
        }

        group.push(message);
    }

    return group;
}

function isGroupableMedia(message: ChatMessage | undefined): message is ChatFileMessage {
    return (
        !!message && message.type === 'file' && /^(image|video)\//.test(message.attachment.mimeType)
    );
}
