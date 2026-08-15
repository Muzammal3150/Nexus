import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, MessageSquareOff, Trash2 } from 'lucide-react';

interface GroupActionsProps {
    isAdmin: boolean;
    onClearChat: () => void;
    onLeave: () => void;
    onDelete: () => void;
}

export function GroupActions({ isAdmin, onClearChat, onLeave, onDelete }: GroupActionsProps) {
    return (
        <div className="space-y-6">
            {/* <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Mute notifications</p>
          <p className="text-xs text-muted-foreground">
            Pause alerts for this chat
          </p>
        </div>
        <Switch checked={muted} onCheckedChange={onMutedChange} />
      </div> */}

            <Separator />

            <div className="space-y-1 ">
                <Button
                    variant="destructive"
                    size={'lg'}
                    className="w-full justify-start "
                    onClick={onClearChat}
                >
                    <MessageSquareOff className="h-4 w-4" />
                    Clear chat history
                </Button>

                <Button
                    variant="destructive"
                    size={'lg'}
                    className="w-full justify-start"
                    onClick={onLeave}
                >
                    <LogOut className="h-4 w-4" />
                    Leave group
                </Button>

                {isAdmin && (
                    <Button
                        variant="destructive"
                        size={'lg'}
                        className="w-full justify-start "
                        onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete group
                    </Button>
                )}
            </div>
        </div>
    );
}
