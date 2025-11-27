import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { Agent, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Heading from '@/components/heading';
import TableAgents from './agents/components/table-agents';
import AgentsPieChart from '@/components/charts/agents-pie-chart';
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
                <Heading title="Dashboard" description="Manage your dashboard" />
                <SummaryCards agents={agents} />
                <div className="grid auto-rows-min gap-4 md:grid-cols-5 relative min-h-[100vh] flex-1 overflow-hidden md:min-h-min">
                    <Card className="col-span-3 flex-1 gap-2">
                        <CardHeader className="px-4">
                            <CardTitle>Last Agents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <TableAgents agents={agents} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-2">
                        <CardHeader className="text-center">
                            <CardTitle>Chats por agente</CardTitle>
                            <CardDescription>Distribuição total de chats</CardDescription>
                        </CardHeader>
                        <CardContent className="flex h-full flex-col gap-4">
                            <AgentsPieChart agents={agents} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout >
    );
}
