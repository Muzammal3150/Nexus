'use client';

import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/db/db';
import type { CachedFile, CachedFileMessage } from '@/db/db.d';

type MediaGridProps = {
    userId: string;
    count?: number;
};

async function getMedia(userId: string, count: number) {
    const messages = await db.messages.where('senderId').equals(userId).toArray();

    const mediaMessages = messages
        .filter((message) => message.type === 'file' && message.attachment?.fileId)
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
        .slice(0, count) as CachedFileMessage[];
        
    const fileIds = mediaMessages
        .map((message) => message.attachment?.fileId)
        .filter((id): id is string => Boolean(id));

    if (!fileIds.length) return [];

    const files = await db.files.bulkGet(fileIds);
    return files.filter((file): file is CachedFile => Boolean(file));
}

export default function MediaGrid({ userId, count = 12 }: MediaGridProps) {
    const {
        data: media = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['userMedia', userId, count],
        queryFn: () => getMedia(userId, count),
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
                <ImageIcon className="mb-2 size-6 text-muted-foreground/50" />
                <p className="text-sm font-medium">Failed to load media</p>
                <p className="text-xs text-muted-foreground">Please try again later.</p>
            </div>
        );
    }

    if (!media.length) {
        return (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
                <ImageIcon className="mb-2 size-6 text-muted-foreground/50" />
                <p className="text-sm font-medium">No media yet</p>
                <p className="text-xs text-muted-foreground">
                    Shared photos and files will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {media.map((file) => (
                <MediaItem key={file.id} file={file} />
            ))}
        </div>
    );
}

function MediaItem({ file }: { file: CachedFile }) {
    const src = URL.createObjectURL(file.file);

    return (
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            {file.file.type?.startsWith('image/') ? (
                <Image src={src} alt={file.file.name ?? 'Media'} fill className="object-cover" />
            ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground/50">
                    <ImageIcon size={18} />
                </div>
            )}
        </div>
    );
}
