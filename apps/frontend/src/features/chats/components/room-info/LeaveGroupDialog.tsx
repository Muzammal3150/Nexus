import { ConfirmDialog } from "./ConfirmDialog";

interface LeaveGroupDialogProps {
  open: boolean;
  groupName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LeaveGroupDialog({
  open,
  groupName,
  onOpenChange,
  onConfirm,
}: LeaveGroupDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Leave "${groupName}"?`}
      description="You'll stop receiving messages from this group. You'll need to be re-invited to rejoin."
      actionLabel="Leave group"
      onConfirm={onConfirm}
    />
  );
}
