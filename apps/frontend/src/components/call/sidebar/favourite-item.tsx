"use client";

import { Phone, Video } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/chat/utils-chat";
import { cn } from "@/lib/utils";
import { CallMethod, FavouriteContact } from "@/types/contacts";

const AVATAR_COLOR_CLASS: Record<FavouriteContact["colorIndex"], string> = {
  1: "bg-chart-1/15 text-chart-1",
  2: "bg-chart-2/15 text-chart-2",
  3: "bg-chart-3/15 text-chart-3",
  4: "bg-chart-4/15 text-chart-4",
  5: "bg-chart-5/15 text-chart-5",
};

interface FavouriteItemProps {
  contact: FavouriteContact;
  onCall: (method: CallMethod) => void;
}

export function FavouriteItem({ contact, onCall }: FavouriteItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/60">
      <div className="relative shrink-0">
        <Avatar className="size-10">
          <AvatarFallback
            className={cn(
              "text-sm font-medium",
              AVATAR_COLOR_CLASS[contact.colorIndex]
            )}
          >
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        {contact.online && (
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{contact.name}</p>
        <p className="text-xs text-muted-foreground">Favourite contact</p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-primary"
          onClick={() => onCall("audio")}
          aria-label={`Audio call ${contact.name}`}
        >
          <Phone className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-primary"
          onClick={() => onCall("video")}
          aria-label={`Video call ${contact.name}`}
        >
          <Video className="size-4" />
        </Button>
      </div>
    </div>
  );
}
