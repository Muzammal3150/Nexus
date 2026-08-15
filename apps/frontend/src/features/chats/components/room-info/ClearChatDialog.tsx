import { ConfirmDialog } from "./ConfirmDialog";

interface ClearChatDialogProps {
  open: boolean;
  groupName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ClearChatDialog({
  open,
  groupName,
  onOpenChange,
  onConfirm,
}: ClearChatDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Clear chat history?"
      description={`This deletes all messages in "${groupName}" for you. Other members will keep their copy of the conversation. This can't be undone.`}
      actionLabel="Clear chat"
      onConfirm={onConfirm}
    />
  );
}
