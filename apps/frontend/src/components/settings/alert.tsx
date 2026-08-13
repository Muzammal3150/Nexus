import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description: string;
    confirmText: string;
    cancelText?: string;
    onConfirm?: () => void;
    disableOutsideClick?: boolean;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmText,
    cancelText,
    onOpenChange,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {cancelText != undefined && (
                        <AlertDialogCancel onClick={() => onOpenChange?.(false)}>
                            {cancelText}
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction
                        onClick={() => {
                            onConfirm?.();
                            onOpenChange?.(false);
                        }}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
