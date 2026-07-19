import { Archive, Circle, MessageCircle, Settings, Star, Users } from 'lucide-react';

const ICONS = {
    chats: MessageCircle,
    status: Circle,
    communities: Users,
    archived: Archive,
    starred: Star,
};

type IconRailItem = {
    key: keyof typeof ICONS;
    label: string;
};

type IconRailProps = {
    items: IconRailItem[];
    active?: keyof typeof ICONS;
    onSelect: (key: keyof typeof ICONS) => void;
};

export default function IconRail({ items, active, onSelect }: IconRailProps) {
    return (
        <div className="flex w-16 shrink-0 flex-col items-center justify-between border-r border-border bg-muted/40 py-4">
            <div className="flex flex-col items-center gap-1">
                {items.map(({ key, label }) => {
                    const Icon = ICONS[key];
                    const isActive = active === key;
                    return (
                        <button
                            key={key}
                            onClick={() => onSelect(key)}
                            title={label}
                            className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col items-center gap-3">
                <button
                    title="Settings"
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Settings className="h-5 w-5" strokeWidth={1.75} />
                </button>
                <button
                    title="Your profile"
                    className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-emerald-600"
                >
                    <div className="flex h-full w-full items-center justify-center bg-emerald-600 text-xs font-semibold text-white">
                        YS
                    </div>
                </button>
            </div>
        </div>
    );
}
