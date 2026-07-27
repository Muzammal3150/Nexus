import { UserPlus, Users } from 'lucide-react';

import { cn } from '@/lib/cn';

const MODES = [
    { value: 'direct', label: 'Direct', icon: UserPlus },
    { value: 'group', label: 'Group', icon: Users },
] as const;

export function ModeToggle({
    mode,
    onChange,
}: {
    mode: 'direct' | 'group';
    onChange: (mode: 'direct' | 'group') => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-1 rounded-lg border bg-background p-1">
            {MODES.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onChange(value)}
                    className={cn(
                        'flex items-center justify-center gap-1.5 rounded-md py-1 text-sm font-medium transition-colors',
                        mode === value
                            ? 'border bg-muted shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                </button>
            ))}
        </div>
    );
}
