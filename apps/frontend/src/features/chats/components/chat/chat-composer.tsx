'use client';

import { Loader2, Paperclip, Send } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useSession } from '@/features/auth/providers/session-provider';
import { chatSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { FileViewGrid } from './file/file-view-grid';
import { sendChatFiles } from '../../file/send-file';

export function ChatComposer({ roomId, className }: { roomId: string; className?: string }) {
    const [value, setValue] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [fileLoading, setFileLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const session = useSession()!;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stopTyping = () => {
        if (!isTyping) return;

        setIsTyping(false);

        chatSocket.emit('chat:typing', {
            roomId,
            isTyping: false,
        });
    };

    const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
        const nextValue = e.target.value;

        setValue(nextValue);

        if (!nextValue.trim()) {
            stopTyping();
            return;
        }

        if (!isTyping) {
            setIsTyping(true);

            chatSocket.emit('chat:typing', {
                roomId,
                isTyping: true,
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 1000);
    };

    const handleSend = () => {
        const trimmed = value.trim();

        if (!trimmed && files.length === 0) return;

        stopTyping();

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        if (trimmed) {
            chatSocket.emit('chat:text', {
                roomId,
                text: trimmed,
            });
        }

        setValue('');
        setFiles([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        setFiles(Array.from(e.target.files));
    };

    const onFileSend = async (files: File[]) => {
        setFileLoading(true);

        try {
            await sendChatFiles({
                files,
                roomId,
                senderId: session.user.id,
            });
        } finally {
            setFileLoading(false);
        }
    };

    return (
        <div className={cn('border-t p-2', className)}>
            {fileLoading ? (
                <div className="absolute inset-0 z-100 flex h-full w-full items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <FileViewGrid files={files} setFiles={setFiles} onFileSend={onFileSend} />
            )}

            <InputGroup className="relative h-fit overflow-hidden px-0.5">
                <input ref={fileInputRef} type="file" hidden multiple onChange={handleUploadFile} />

                <InputGroupAddon>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                </InputGroupAddon>

                <InputGroupInput
                    value={value}
                    onChange={handleTyping}
                    placeholder="Type a message"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />

                <InputGroupAddon align="inline-end">
                    <Button type="button" size="icon" onClick={handleSend}>
                        <Send className="h-4 w-4" />
                    </Button>
                </InputGroupAddon>
            </InputGroup>
        </div>
    );
}
