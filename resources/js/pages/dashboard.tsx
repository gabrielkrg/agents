import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { Agent, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SummaryCards from './dashboard/components/summary-cards';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ agents }: { agents: Agent[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Dashboard</h2>
                    <p className='text-muted-foreground'>
                        Here&apos;s a overview of your agents and chats!
                    </p>
                </div>
                <SummaryCards agents={agents} />
            </div>
        </AppLayout >
    );
}
