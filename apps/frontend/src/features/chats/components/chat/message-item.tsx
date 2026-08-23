import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message';
import { MessageScrollerItem } from '@/components/ui/message-scroller';
import { getInitials } from '@/features/chats/lib/utils-chat';
import { format } from 'date-fns';
import { MessageFileContent } from './file-message';
import { ChatMessage } from '../../types/messages';
import { Room } from '../../types/room';



interface MessageItemProps {
    message: ChatMessage;
    showSender:boolean;
    room: Room;
}

interface SystemMessageItemProps {
    message: Extract<ChatMessage, { type: 'system' }>;
}

interface MessageTextContentProps {
    message: Extract<ChatMessage, { type: 'text' }>;
    showSender: boolean;
}

export function MessageItem({ message, showSender, room }: MessageItemProps) {
    if (message.type === 'system') {
        return <SystemMessageItem message={message} />;
    }



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

export function SystemMessageItem({ message }: SystemMessageItemProps) {
    return (
        <MessageScrollerItem messageId={message.id}>
            <div className="flex justify-center py-1">
                <div className="rounded-full bg-muted px-3 py-1 text-center text-xs text-muted-foreground">
                    <span>{message.message}</span>
                    <span className="ml-2 opacity-60">
                        {format(message.sentAt, 'p').toLowerCase()}
                    </span>
                </div>
            </div>
        </MessageScrollerItem>
    );
}

export function MessageTextContent({ message, showSender }: MessageTextContentProps) {
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
