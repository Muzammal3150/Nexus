import { format, formatDistanceToNow } from "date-fns";
import { CalendarDays, Clock, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CopyEmailButton from "./copy-email-button";
import type { User } from "./types";

export default function DetailsCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div>
            <dt className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="size-3.5" />
              Email
            </dt>
            <dd className="mt-1 flex items-center gap-2">
              <span className="truncate text-sm">{user.email}</span>
              <CopyEmailButton email={user.email} />
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              Member since
            </dt>
            <dd className="mt-1 text-sm">{format(user.createdAt, "MMMM d, yyyy")}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              Profile updated
            </dt>
            <dd className="mt-1 text-sm">{formatDistanceToNow(user.updatedAt, { addSuffix: true })}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
