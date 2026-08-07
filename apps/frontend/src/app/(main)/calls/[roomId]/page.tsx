'use client';

import { CallControls } from '@/components/call/video/call-controls';
import { MemberGrid } from '@/components/call/video/member-grid';
import { SpotlightView } from '@/components/call/video/spotlight-view';
import { useCall } from '@/hooks/call/useCall';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function VideoCallPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const { room, members, isLoading, myStream } = useCall(roomId);

    useEffect(() => {
        if (room == null && !isLoading) {
            return notFound();
        }
    }, [room, isLoading]);

    console.log(members)
    const [focusedId, setFocusedId] = useState<string | null>(null);
    // const [sheetOpen, setSheetOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    // const onLeave = () => {};

    function toggleFullscreen() {
        if (!containerRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen?.();
        }
    }

    if (isLoading) return 'Loading.....';

    return (
        <div ref={containerRef} className="flex size-full flex-col ">
            {/* <CallTopBar
                title={'Team Standup'}
                durationLabel={'0'}
                memberCount={members.length}
                onShowMembers={() => setSheetOpen(true)}
            /> */}

            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-muted/20">
                {focusedId ? (
                    <SpotlightView
                        focusedId={focusedId}
                        members={members}
                        onBackToGrid={() => setFocusedId(null)}
                        onFocus={setFocusedId}
                    />
                ) : (
                    <MemberGrid members={members} onFullView={setFocusedId} />
                )}
            </div>

            <CallControls
                myStream={myStream}
                onToggleFullScreen={toggleFullscreen}
            />

            {/* <MemberSheet open={sheetOpen} onOpenChange={setSheetOpen} members={members} /> */}
        </div>
    );
}
