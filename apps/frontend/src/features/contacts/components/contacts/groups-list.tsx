import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface Group {
  id: string;
  name: string;
  members: number;
}

export default function GroupsList({ groups }: { groups: Group[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {groups.map((g) => (
        <Card key={g.id} className="transition-colors hover:bg-accent">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{g.name}</p>
              <p className="text-xs text-muted-foreground">{g.members} members</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
