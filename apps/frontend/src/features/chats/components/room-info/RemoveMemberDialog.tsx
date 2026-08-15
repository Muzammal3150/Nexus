import type { Member } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

interface RemoveMemberDialogProps {
  member: Member | null;
  groupName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RemoveMemberDialog({
  member,
  groupName,
  onOpenChange,
  onConfirm,
}: RemoveMemberDialogProps) {
  return (
    <ConfirmDialog
      open={!!member}
      onOpenChange={onOpenChange}
      title={`Remove ${member?.name ?? "this member"}?`}
      description={`They'll be removed from "${groupName}" and won't see new messages. They can be added back later.`}
      actionLabel="Remove"
      onConfirm={onConfirm}
    />
  );
}
