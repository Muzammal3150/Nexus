'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Message, MessageAvatar, MessageContent, MessageFooter } from '@/components/ui/message';
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { ChatMessage } from '@/types/messages';
import { format } from 'date-fns';
import React from 'react';
import { MessageFileContent } from './file-message';

interface ChatThreadProps {
    messages?: Partial<Record<string, ChatMessage[]>>;
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

export function ChatThread({ messages }: ChatThreadProps) {
    return (
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller className=" bg-muted/20  ">
                <MessageScrollerViewport>
                    <MessageScrollerContent className="flex flex-col gap-3 px-6 py-4">
                        {messages &&
                            Object.keys(messages).map((day) => (
                                <React.Fragment key={day}>
                                    <Marker variant="separator">
                                        <MarkerContent>{day}</MarkerContent>
                                    </Marker>

                                    {messages[day]!.map((message) => (
                                        <MessageItem key={message.id} message={message} />
                                    ))}
                                </React.Fragment>
                            ))}
                    </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
            </MessageScroller>
        </MessageScrollerProvider>
    );
}
function MessageItem({ message }: { message: ChatMessage }) {
    return (
        <MessageScrollerItem messageId={message.id}>
            <Message align={message.isMine ? 'end' : 'start'}>
                {!message.isMine && (
                    <MessageAvatar>
                        <Avatar className="size-7">
                            <AvatarFallback className="text-[10px]">M</AvatarFallback>
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
        <MessageContent>
            <Bubble variant={isMine ? 'default' : 'muted'}>
                <BubbleContent>{text}</BubbleContent>
            </Bubble>
            <MessageFooter className="text-[11px] text-muted-foreground">
                <span>{format(sentAt, 'p')}</span>
                {/* {message.isMine && (
                                                    <StatusIcon status={message.status} />
                                                    )} */}
            </MessageFooter>
        </MessageContent>
    );
}
