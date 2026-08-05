'use client';

import { CallTopBar } from '@/components/call/video/call-top-bar';
import { MemberGrid } from '@/components/call/video/member-grid';
import { SpotlightView } from '@/components/call/video/spotlight-view';
import { useCall } from '@/hooks/call/useCall';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function VideoCallPage() {
    const params = useParams();
    const roomId = params.callId!.toString();
    const { room, members, isLoading, memberStreams } = useCall(roomId);
    // console.log(room, members, isLoading);

    useEffect(() => {
        if (room == null && !isLoading) {
            return notFound();
        }
    }, [room, isLoading]);

    const [focusedId, setFocusedId] = useState<string | null>(null);
    // const [sheetOpen, setSheetOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const onLeave = () => {};

    // function toggleFullscreen() {
    //     if (!containerRef.current) return;
    //     if (document.fullscreenElement) {
    //         document.exitFullscreen();
    //     } else {
    //         containerRef.current.requestFullscreen?.();
    //     }
    // }

    const focused = focusedId ? members.find((m) => m.user.id === focusedId) : undefined;
    const others = focused ? members.filter((m) => m.user.id !== focused.user.id) : [];
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
                {focused ? (
                    <SpotlightView
                        focused={focused}
                        stream={memberStreams.get(focused.user.id)}
                        others={others}
                        othersStream={memberStreams}
                        onBackToGrid={() => setFocusedId(null)}
                        onFocus={setFocusedId}
                    />
                ) : (
                    <MemberGrid
                        members={members}
                        membersStream={memberStreams}
                        onFullView={setFocusedId}
                    />
                )}
            </div>

            {/* <CallControls
                muted={!self?.state.mic}
                cameraOff={!self?.state.camera}
                onToggleMute={() => updateSelf({ muted: !self?.muted })}
                onToggleCamera={() => console.log(call.callControllerRef.current?.peers)}
                onToggleFullscreen={toggleFullscreen}
                onLeave={() => onLeave?.()}
            /> */}

            {/* <MemberSheet open={sheetOpen} onOpenChange={setSheetOpen} members={members} /> */}
        </div>
    );
}