'use client';

import { Check, CheckCheck } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Message, MessageAvatar, MessageContent, MessageFooter } from '@/components/ui/message';
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import type { ChatMessage } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface ChatThreadProps {
    messages: ChatMessage[];
}

function StatusIcon({ status }: { status?: ChatMessage['status'] }) {
    if (status === 'read') {
        return <CheckCheck className="size-3.5 text-primary" />;
    }
    if (status === 'delivered') {
        return <CheckCheck className="size-3.5" />;
    }
    if (status === 'sent') {
        return <Check className="size-3.5" />;
    }
    return null;
}

export function ChatThread({ messages }: ChatThreadProps) {
    return (
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller className="flex-1 bg-muted/20">
                <MessageScrollerViewport>
                    <MessageScrollerContent className="flex flex-col gap-3 px-6 py-4">
                        {messages.map((message) => (
                            <MessageItem message={message} key={message.id} />
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
                <MessageContent>
                    <Bubble variant={message.isMine ? 'default' : 'muted'}>
                        <BubbleContent>{message.text}</BubbleContent>
                    </Bubble>
                    <MessageFooter className="text-[11px] text-muted-foreground">
                        <span>
                            {formatDistanceToNow(message.time, {
                                addSuffix: true,
                            })}
                        </span>
                        {/* {message.isMine && (
                                                    <StatusIcon status={message.status} />
                                                )} */}
                    </MessageFooter>
                </MessageContent>
            </Message>
        </MessageScrollerItem>
    );
}
