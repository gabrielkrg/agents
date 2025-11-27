import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Agent } from '@/types';
import { Activity, FileText, MessageCircle, Users } from 'lucide-react';

interface SummaryCardsProps {
    agents: Agent[];
}

export default function SummaryCards({ agents }: SummaryCardsProps) {
    const totalAgents = agents.length;
    const totalChats = agents.reduce((sum, agent) => sum + agent.chats.length, 0);
    const agentsWithChats = agents.filter(agent => agent.chats.length > 0).length;
    const agentsWithSchema = agents.filter(agent => agent.json_schema).length;
    const avgChatsPerAgent = totalAgents ? Math.round(totalChats / totalAgents) : 0;
    const topAgent = agents.reduce(
        (current, agent) =>
            agent.chats.length > current.chats
                ? { name: agent.name, chats: agent.chats.length }
                : current,
        { name: 'Nenhum agente', chats: 0 },
    );

    const summaryCards = [
        {
            title: 'Agents',
            description: 'AI Agents to match your needs',
            value: totalAgents,
            subtext: `${agentsWithChats} with recent chats`,
            action: 'View agents',
            footer: 'Updated in real time',
            icon: Users,
        },
        {
            title: 'Chats',
            description: 'Total chats',
            value: totalChats,
            subtext: `${avgChatsPerAgent} per agent on average`,
            action: 'View chats',
            footer: 'Includes archived history',
            icon: MessageCircle,
        },
        {
            title: 'Schemas',
            description: 'Agents ready for API',
            value: agentsWithSchema,
            subtext: `${totalAgents - agentsWithSchema} waiting for setup`,
            action: 'Manage schemas',
            footer: 'Recommended if return is for API',
            icon: FileText,
        },
        {
            title: 'Top Agent',
            description: topAgent.name,
            value: topAgent.chats,
            subtext: 'Completed chats',
            action: 'View top agent',
            footer: 'Based on the last 7 days',
            icon: Activity,
        },
    ];

    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            {summaryCards.map(({ title, description, action, value, subtext, footer, icon: Icon }) => (
                <Card key={title} className="border-border/60">
                    <CardHeader className="flex flex-row items-start justify-between gap-2">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <span className="rounded-full bg-primary/10 p-2 text-primary">
                            <Icon className="h-5 w-5" />
                        </span>
                        <CardAction className="text-xs text-primary">{action}</CardAction>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1">
                        <span className="text-3xl font-semibold tracking-tight">{value}</span>
                        <span className="text-sm text-muted-foreground">{subtext}</span>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">{footer}</CardFooter>
                </Card>
            ))}
        </div>
    );
}

