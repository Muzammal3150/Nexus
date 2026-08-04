"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/chat/utils-chat";

const AVATAR_COLOR_CLASS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-chart-1/15 text-chart-1",
  2: "bg-chart-2/15 text-chart-2",
  3: "bg-chart-3/15 text-chart-3",
  4: "bg-chart-4/15 text-chart-4",
  5: "bg-chart-5/15 text-chart-5",
};

interface AudioCallScreenProps {
  name: string;
  colorIndex: 1 | 2 | 3 | 4 | 5;
  onEnd: () => void;
}

export function AudioCallScreen({ name, colorIndex, onEnd }: AudioCallScreenProps) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const duration = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-muted/20">
      <div className="flex flex-col items-center gap-3">
        <Avatar className="size-24">
          <AvatarFallback className={cn("text-2xl font-medium", AVATAR_COLOR_CLASS[colorIndex])}>
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-base font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{duration} · Audio call</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={muted ? "default" : "outline"}
          size="icon"
          className="size-11 rounded-full"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="size-14 rounded-full"
          onClick={onEnd}
          aria-label="End call"
        >
          <PhoneOff className="size-5" />
        </Button>
        <Button
          variant={speaker ? "default" : "outline"}
          size="icon"
          className="size-11 rounded-full"
          onClick={() => setSpeaker((s) => !s)}
          aria-label="Toggle speaker"
        >
          <Volume2 className="size-5" />
        </Button>
      </div>
    </div>
  );
}
