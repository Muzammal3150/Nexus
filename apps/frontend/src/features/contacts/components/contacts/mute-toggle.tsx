"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function MuteToggle() {
  const [muted, setMuted] = useState(false);

  return <Switch checked={muted} onCheckedChange={setMuted} aria-label="Mute notifications" />;
}
