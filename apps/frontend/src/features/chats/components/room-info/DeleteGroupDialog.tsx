import { ConfirmDialog } from "./ConfirmDialog";

interface DeleteGroupDialogProps {
  open: boolean;
  groupName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteGroupDialog({
  open,
  groupName,
  onOpenChange,
  onConfirm,
}: DeleteGroupDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete "${groupName}"?`}
      description="This permanently deletes the group and all messages for every member. This action can't be undone."
      actionLabel="Delete group"
      onConfirm={onConfirm}
    />
  );
}
