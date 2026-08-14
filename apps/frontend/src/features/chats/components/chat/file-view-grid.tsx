import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, FileText, FileAudio, FileVideo, File as FileIcon, Plus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getKind(file: File): 'image' | 'video' | 'audio' | 'other' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'other';
}

function FileIconFor({ file, className }: { file: File; className?: string }) {
    const kind = getKind(file);
    if (kind === 'video') return <FileVideo className={className} />;
    if (kind === 'audio') return <FileAudio className={className} />;
    if (file.type === 'application/pdf' || file.type.includes('text'))
        return <FileText className={className} />;
    return <FileIcon className={className} />;
}

function useObjectUrl(file: File | null) {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);
    return url;
}

function Thumbnail({ file }: { file: File }) {
    const url = useObjectUrl(getKind(file) === 'image' ? file : null);
    if (url) {
        return <img src={url} alt={file.name} className="h-full w-full object-cover" />;
    }
    return (
        <div className="flex h-full w-full items-center justify-center bg-muted">
            <FileIconFor file={file} className="h-6 w-6 text-muted-foreground" />
        </div>
    );
}

export function FileViewGrid({
    files,
    setFiles,
    onFileSend,
}: {
    files: File[];
    setFiles: (files: File[]) => void;
    onFileSend: (files: File[]) => void;
}) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (activeIndex >= files.length) {
            setActiveIndex(Math.max(0, files.length - 1));
        }
    }, [files.length, activeIndex]);

    const activeFile = files[activeIndex] ?? null;
    const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);
    const onClose = () => setFiles([]);
    const onSubmit = () => {
        onFileSend(files);
        setFiles([]);
    };

    if (!activeFile) return null;

    return (
        <div className="absolute left-0 top-0 z-100 flex h-full w-full flex-col bg-background">
            {/* Header */}
            <Button
                variant="ghost"
                size="icon-lg"
                onClick={onClose}
                className="absolute left-2 top-2"
                aria-label="Close"
            >
                <X className="" />
            </Button>

            {/* Main preview */}
            <FilePreview activeFile={activeFile} />
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-tight">{activeFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatBytes(activeFile.size)} · {files.length} file
                        {files.length > 1 ? 's' : ''} selected
                    </p>
                </div>
            </div>
            <FileThumb
                files={files}
                setFiles={setFiles}
                setActiveIndex={setActiveIndex}
                activeIndex={activeIndex}
            />
            {/* Thumbnail strip */}

            {/* Footer / submit */}
            <div className="flex items-center justify-between border-t px-4 py-3">
                <Badge variant="secondary">{formatBytes(totalSize)} total</Badge>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose} size={'lg'}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} size={'lg'}>
                        <Send />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function FilePreview({ activeFile }: { activeFile: File }) {
    const activeKind = activeFile ? getKind(activeFile) : null;

    const previewUrl = useObjectUrl(
        activeFile && (activeKind === 'image' || activeKind === 'video') ? activeFile : null,
    );
    return (
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-muted/30 p-4">
            {activeKind === 'image' && previewUrl && (
                <img
                    src={previewUrl}
                    alt={activeFile.name}
                    className="max-h-full max-w-full rounded-md object-contain"
                />
            )}
            {activeKind === 'video' && previewUrl && (
                <video src={previewUrl} controls className="max-h-full max-w-full rounded-md" />
            )}
            {(activeKind === 'audio' || activeKind === 'other') && (
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <FileIconFor file={activeFile} className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{activeFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatBytes(activeFile.size)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function FileThumb({
    files,
    setActiveIndex,
    activeIndex,
    setFiles,
}: {
    files: File[];
    setFiles: (files: File[]) => void;
    setActiveIndex: (activeIndex: number) => void;
    activeIndex: number;
}) {
    function removeFile(index: number) {
        const next = files.filter((_, i) => i !== index);
        setFiles(next);
    }

    function fileKey(file: File) {
        return `${file.name}-${file.size}-${file.lastModified}`;
    }

    function addFiles(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const existingKeys = new Set(files.map(fileKey));
        const incoming = Array.from(e.target.files);
        const deduped = incoming.filter((f) => !existingKeys.has(fileKey(f)));

        setFiles([...files, ...deduped]);
        e.target.value = '';
    }

    return (
        <ScrollArea className="w-full whitespace-nowrap  p-3">
            <div className="flex items-center justify-center gap-2 ">
                {files.map((file, i) => (
                    <button
                        key={`${file.name}-${i}`}
                        onClick={() => setActiveIndex(i)}
                        className={cn(
                            'group relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition',
                            i === activeIndex
                                ? 'border-primary'
                                : 'border-border hover:border-foreground/40',
                        )}
                    >
                        <Thumbnail file={file} />
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile(i);
                            }}
                            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                        >
                            <X className="h-2.5 w-2.5" />
                        </span>
                    </button>
                ))}

                <label
                    className={cn(
                        'flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                    )}
                >
                    <Plus className="h-5 w-5" />
                    <input type="file" multiple className="hidden" onChange={addFiles} />
                </label>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
