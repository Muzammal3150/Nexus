'use client';

import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { CachedFile } from '@/db/db.d';

type MediaGridProps = {
    userId: string;
    count?: number;
};

export default function MediaGrid({ userId, count = 12 }: MediaGridProps) {
    const media = useLiveQuery(async () => {
        const messages = await db.messages.where('senderId').equals(userId).toArray();

        const mediaMessages = messages
            .filter((message) => message.type === 'file')
            .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
            .slice(0, count);

        const fileIds = mediaMessages
            .map((message) => message.attachment?.fileId)
            .filter((id): id is string => Boolean(id));

        if (!fileIds.length) {
            return [];
        }

        const files = await db.files.bulkGet(fileIds);

        return files.filter((file): file is CachedFile => Boolean(file));
    }, [userId, count]);

    if (!media) {
        return (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {media.map((file) => (
                <div
                    key={file.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                    {file.file.type?.startsWith('image/') ? (
                        <Image
                            src={URL.createObjectURL(file.file)}
                            alt={file.file.name ?? 'Media'}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/50">
                            <ImageIcon size={18} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
