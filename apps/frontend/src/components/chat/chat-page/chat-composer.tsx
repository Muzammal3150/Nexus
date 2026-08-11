'use client';

import { Loader2, Paperclip, Send } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

import { useSession } from '@/components/providers/session-provider';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { sendChatFiles } from '@/lib/chat/file/sendFile';
import { chatSocket } from '@/lib/socket';
import { FileViewGrid } from './file-view-grid';
import { cn } from '@/lib/utils';

export function ChatComposer({ roomId, className }: { roomId: string; className?: string }) {
    const [value, setValue] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const session = useSession()!;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileLoading, setFileLoading] = useState(false);

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed && files.length === 0) return;

        chatSocket.emit('chat:text', {
            roomId,
            text: trimmed,
        });

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
        await sendChatFiles({ files, roomId, senderId: session.user.id });
        setFileLoading(false);
    };
    return (
        <div className={cn('border-t p-2', className)}>
            {/* Drawer */}
            {fileLoading ? (
                <div className="absolute inset-0 z-100 flex h-full w-full items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <FileViewGrid files={files} setFiles={setFiles} onFileSend={onFileSend} />
            )}
            <InputGroup className="relative overflow-hidden px-0.5 h-fit">
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
                    onChange={(e) => setValue(e.target.value)}
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
