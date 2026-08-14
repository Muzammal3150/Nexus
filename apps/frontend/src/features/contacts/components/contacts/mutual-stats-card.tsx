import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Presence } from "./types";

export default function MutualStatsCard({ presence }: { presence: Presence }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Mutual</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xl font-semibold">{presence.sharedGroups}</p>
          <p className="text-xs text-muted-foreground">Shared groups</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xl font-semibold">{presence.mutualContacts}</p>
          <p className="text-xs text-muted-foreground">Mutual contacts</p>
        </div>
      </CardContent>
    </Card>
  );
}
