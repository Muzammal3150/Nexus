'use client';

import { Paperclip, Send } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { FileViewGrid } from './file-view-grid';
import { chatSocket } from '@/lib/socket';

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
    const onFileSend = (files: File[]) => {
        files.forEach((file) => {
            chatSocket.emit('chat:file', {
                roomId,
                file,
            });
        });
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

// function FilesViewGrid({ files, onRemove }: { files: File[]; onRemove: (file: File) => void }) {
//     if (files.length == 0) return null;
//     return (
//         <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border bg-background shadow-lg">
//             <div className=" grid gap-2 grid-cols-8 overflow-y-auto p-2">
//                 <AnimatePresence>
//                     {files.map((file, index) => (
//                         <motion.div
//                             key={index}
//                             layout
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                         >
//                             <Attachment orientation={'vertical'} className="w-full!">
//                                 <AttachmentMedia>
//                                     <FileTextIcon />
//                                 </AttachmentMedia>
//                                 <AttachmentContent>
//                                     <AttachmentTitle>{file.name}</AttachmentTitle>
//                                     <AttachmentDescription>
//                                         PDF · {formatFileSize(file.size)}
//                                     </AttachmentDescription>
//                                 </AttachmentContent>
//                                 <AttachmentActions>
//                                     <AttachmentAction
//                                         aria-label="Remove File"
//                                         onClick={() => onRemove(file)}
//                                     >
//                                         <XIcon />
//                                     </AttachmentAction>
//                                 </AttachmentActions>
//                             </Attachment>
//                         </motion.div>
//                     ))}
//                 </AnimatePresence>
//             </div>
//         </div>
//     );
// }
