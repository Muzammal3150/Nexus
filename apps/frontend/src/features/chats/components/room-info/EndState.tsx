import type { ReactNode } from "react";

interface EndStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function EndState({ icon, title, description }: EndStateProps) {
  return (
    <div className="mx-auto flex min-h-[560px] w-full max-w-md flex-col items-center justify-center gap-3 rounded-xl border bg-background px-6 text-center text-foreground">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
