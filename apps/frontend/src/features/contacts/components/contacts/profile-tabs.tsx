'use client';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TabConfig {
    key: string;
    label: string;
    count: number;
    content: ReactNode;
}

interface ProfileTabsProps {
    tabs: TabConfig[];
    defaultTab?: string;
}

export default function ProfileTabs({ tabs, defaultTab }: ProfileTabsProps) {
    return (
        <Tabs
            defaultValue={defaultTab ?? tabs[0]?.key}
            className="rounded-2xl flex-col border border-border bg-card p-5 lg:p-6"
        >
            <TabsList>
                {tabs.map((t) => (
                    <TabsTrigger key={t.key} value={t.key} className="gap-1.5">
                        {t.label}
                        <Badge variant="secondary" className="px-1.5">
                            {t.count}
                        </Badge>
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((t) => (
                <TabsContent key={t.key} value={t.key} className="pt-5">
                    {t.content}
                </TabsContent>
            ))}
        </Tabs>
    );
}
