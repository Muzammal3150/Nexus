'use client';
import { callSocket } from '@/lib/socket';

import { User } from '@/features/auth/lib/auth';
import { Phone, PhoneOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';

interface CallRoom {
    id: string;
    memberIds: string[];
    sender: User;
    sendedAt: Date;
}

export function CallToaster() {
    const router = useRouter();
    const [callToasts, setCallToasts] = useState<CallRoom[]>([]);
    useEffect(() => {

        const handleInvite = (room: CallRoom) => {
            setCallToasts((prev) => [...prev, room]);
        };

        callSocket.on('call:invite-broadcast', handleInvite);

        return () => {
            callSocket.off('call:invite-broadcast', handleInvite);
        };
    }, []);

    const handleAccept = (callRoom: CallRoom) => {
        setCallToasts((prev) => prev.filter((call) => call.id !== callRoom.id));
        callSocket.emit('call:accept', { roomId: callRoom.id });

        router.push(`/calls/${callRoom.id}`);
    };
    const handleDecline = (callRoom: CallRoom) => {
        setCallToasts((prev) => prev.filter((call) => call.id !== callRoom.id));
        callSocket.emit('call:reject', { roomId: callRoom.id });
    };

    return (
        <div className="fixed bottom-0 right-0 z-9999 flex flex-col items-end gap-2 p-4">
            <div className="flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                    {callToasts.map((call) => (
                        <CallToast
                            key={call.id}
                            callRoom={call}
                            onAccept={handleAccept}
                            onDecline={handleDecline}
                            onCancel={handleDecline}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export function CallToast({
    callRoom,
    onAccept,
    onDecline,
    onCancel,
}: {
    callRoom: CallRoom;
    onAccept: (callRoom: CallRoom) => void;
    onDecline: (callRoom: CallRoom) => void;
    onCancel: (callRoom: CallRoom) => void;
}) {
    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                x: 80,
                scale: 0.9,
            }}
            animate={{
                opacity: 1,
                x: 0,
                scale: 1,
            }}
            exit={{
                opacity: 0,
                x: 80,
                scale: 0.9,
                transition: {
                    duration: 0.2,
                },
            }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 28,
            }}
        >
            <Card className="w-90 ring-primary bg-background/80 backdrop-blur-md overflow-visible   relative">
                <CardHeader className="">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => onCancel?.(callRoom)}
                    >
                        <X />
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 ring-2 ring-green-500/20">
                            <AvatarImage
                                src={callRoom.sender.image || undefined}
                                alt={callRoom.sender.name}
                            />
                            <AvatarFallback>
                                {callRoom.sender.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-muted-foreground">
                                Incoming Call
                            </span>

                            <span className="text-lg font-semibold">{callRoom.sender.name}</span>

                            <span className="text-sm text-muted-foreground">
                                @{callRoom.sender.username}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="bg-background/90 border-t pt-4">
                    <div className="flex gap-3">
                        <Button
                            variant="destructive"
                            size="lg"
                            className="flex-1 gap-2"
                            onClick={() => onDecline?.(callRoom)}
                        >
                            <PhoneOff className="h-4 w-4" />
                            Decline
                        </Button>

                        <Button
                            size="lg"
                            variant="default"
                            className="flex-1 gap-2"
                            onClick={() => onAccept?.(callRoom)}
                        >
                            <Phone className="h-4 w-4" />
                            Accept
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
