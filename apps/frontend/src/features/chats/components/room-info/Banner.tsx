interface BannerProps {
  message: string | null;
}

export function Banner({ message }: BannerProps) {
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 top-3 z-[60] mx-auto w-fit rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
      {message}
    </div>
  );
}
