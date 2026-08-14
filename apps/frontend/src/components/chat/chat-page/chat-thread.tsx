'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Message, MessageAvatar, MessageContent, MessageFooter } from '@/components/ui/message';
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { getInitials } from '@/lib/chat/utils-chat';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types/messages';
import { format } from 'date-fns';
import React from 'react';
import { MessageFileContent } from './file-message';
import { Room } from '@/types/room';

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

                                {messages[day]!.map((message) => (
                                    <MessageItem key={message.id} message={message} room={room} />
                                ))}
                            </React.Fragment>
                        ))}
                </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
        </MessageScroller>
    );
}
function MessageItem({ message, room }: { message: ChatMessage; room: Room }) {
    return (
        <MessageScrollerItem messageId={message.id}>
            <Message align={message.isMine ? 'end' : 'start'}>
                {!message.isMine && room.isGroup && (
                    <MessageAvatar className="translate-0! self-start">
                        <Avatar>
                            <AvatarImage src={message.sender.image ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                                {getInitials(message.sender.name)}
                            </AvatarFallback>
                        </Avatar>
                    </MessageAvatar>
                )}
                {message.type == 'text' ? (
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
            <MessageFooter className=" text-muted-foreground">
                {/* {message.isMine && (
                                                    <StatusIcon status={message.status} />
                                                    )} */}
            </MessageFooter>
        </MessageContent>
    );
}
