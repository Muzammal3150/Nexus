'use client';

import { Paperclip, Send } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { FileViewGrid } from './file-view-grid';
import { chatSocket } from '@/lib/socket';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { api } from '@/lib/axios';
import { toast } from '@/components/ui/toast';
import axios from 'axios';

export function ChatComposer({ roomId }: { roomId: string }) {
    const [value, setValue] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSend = () => {
        const trimmed = value.trim();

        if (!trimmed && files.length === 0) return;

        chatSocket.emit('chat:text', {
            roomId,
            body: trimmed,
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
    type UploadedFile = {
        filename: string;
        mimetype: string;
        size: number;
        originalname: string;
    };

    const onFileSend = async (files: File[]) => {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const { data } = await api.post<{ files: UploadedFile[] }>(
                '/uploads/chat/many',
                formData,
            );

            data.files.forEach((file) => {
                chatSocket.emit('chat:file', {
                    roomId,
                    file,
                });
            });
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message ?? error.message)
                : 'Something went wrong';

            toast.add({ type: 'error', description: message });
        }
    };
    return (
        <div className="border-t p-2">
            {/* Drawer */}
            <FileViewGrid files={files} setFiles={setFiles} onFileSend={onFileSend} />
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
