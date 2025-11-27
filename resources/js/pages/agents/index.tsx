import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { index as agentsIndex } from '@/routes/agents';
import CreateAgent from './components/create-agent';
import { Agent } from '@/types';
import ListAgents from './components/list-agents';
import Heading from '@/components/heading';
import TableAgents from './components/table-agents';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Agents',
        href: agentsIndex().url,
    },
];

export default function Agents({ agents }: { agents: Agent[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agents" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Agents"
                        description="Manage your agents"
                    />
                    <CreateAgent />
                </div>
                <div className="relative p-4 min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {agents.length > 0 ? (
                        <TableAgents agents={agents} />
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-muted-foreground">No agents found.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
