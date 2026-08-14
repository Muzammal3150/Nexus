import { ReactNode } from 'react';

export default function ProfileSection({
    id,
    title,
    description,
    children,

}: {
    id: string;
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section id={id}>
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>

            <div className="p-6 space-y-6"> {children}</div>
            <hr />
        </section>
    );
}
