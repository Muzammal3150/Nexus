'use client';

import { CallControls } from '@/components/call/video/call-controls';
import { CallTopBar } from '@/components/call/video/call-top-bar';
import { MemberGrid } from '@/components/call/video/member-grid';
import { MemberSheet } from '@/components/call/video/member-sheet';
import { SpotlightView } from '@/components/call/video/spotlight-view';
import { useCall } from '@/hooks/call/useCall';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function VideoCallPage() {
    const params = useParams();
    const roomId = params.callId!.toString();
    const call = useCall(roomId);

    useEffect(() => {
        if (call.room == null && !call.isLoading) {
            return notFound();
        }
    }, [call.room, call.isLoading]);

    console.log(call.room, call.isLoading);

    const { members, self } = call;

    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const onLeave = () => {
        // Handle leaving the call, e.g., navigate away or close the call modal
        console.log('Leaving the call...');
    };
    useEffect(() => {
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    function toggleFullscreen() {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen?.();
        }
    }

    const focused = focusedId ? members.find((m) => m.user.id === focusedId) : undefined;
    const others = focused ? members.filter((m) => m.user.id !== focused.user.id) : [];

    const durationLabel = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
        seconds % 60,
    ).padStart(2, '0')}`;

    return (
        <div ref={containerRef} className="flex size-full flex-col ">
            <CallTopBar
                title={'Team Standup'}
                durationLabel={durationLabel}
                memberCount={members.length}
                onShowMembers={() => setSheetOpen(true)}
            />

            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-muted/20">
                {focused ? (
                    <SpotlightView
                        focused={focused}
                        others={others}
                        onBackToGrid={() => setFocusedId(null)}
                        onFocus={setFocusedId}
                    />
                ) : (
                    <MemberGrid members={members} onFullView={setFocusedId} />
                )}
            </div>

            <CallControls
                muted={!self?.state.mic}
                cameraOff={!self?.state.camera}
                onToggleMute={() => updateSelf({ muted: !self?.muted })}
                onToggleCamera={() => updateSelf({ cameraOff: !self?.cameraOff })}
                onToggleFullscreen={toggleFullscreen}
                onLeave={() => onLeave?.()}
            />

            <MemberSheet open={sheetOpen} onOpenChange={setSheetOpen} members={members} />
        </div>
    );
}
