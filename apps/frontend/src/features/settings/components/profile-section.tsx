import { ReactNode } from 'react';

export default function ProfileSection({
    id,
    title,
    description,
    children,
    className,
}: {
    id: string;
    className?: string;
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className={className}>
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>

            <div className="p-6 space-y-6"> {children}</div>
            <hr className="col-span-full" />
        </section>
    );
}
