import { Card, CardContent } from "@/components/ui/card";
import MuteToggle from "./mute-toggle";

export default function NotificationsCard() {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Mute notifications</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Pause alerts from this conversation</p>
        </div>
        <MuteToggle />
      </CardContent>
    </Card>
  );
}
