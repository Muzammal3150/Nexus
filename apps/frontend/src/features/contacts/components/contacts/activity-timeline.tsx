import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  label: string;
  date: Date;
}

export default function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="space-y-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon size={16} />
            </div>
            <div>
              <p className="text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{format(item.date, "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
