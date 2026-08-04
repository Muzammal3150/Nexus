"use client";

import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CallTopBarProps {
  title: string;
  durationLabel: string;
  memberCount: number;
  onShowMembers: () => void;
}

export function CallTopBar({
  title,
  durationLabel,
  memberCount,
  onShowMembers,
}: CallTopBarProps) {
  return (
    <div className="flex items-center justify-between border-b bg-background/80 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/60" />
          <span className="relative inline-flex size-2 rounded-full bg-destructive" />
        </span>
        <p className="text-sm font-medium">{title}</p>
        <span className="text-sm text-muted-foreground">{durationLabel}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        onClick={onShowMembers}
      >
        <Users className="size-4" />
        {memberCount}
        <Badge variant="secondary" className="sr-only">
          participants
        </Badge>
      </Button>
    </div>
  );
}
