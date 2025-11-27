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
            title: 'Agentes ativos',
            description: 'Gerenciando atendimentos',
            value: totalAgents,
            subtext: `${agentsWithChats} com chats recentes`,
            action: 'Ver agentes',
            footer: 'Atualizado em tempo real',
            icon: Users,
        },
        {
            title: 'Chats registrados',
            description: 'Conversas totais',
            value: totalChats,
            subtext: `${avgChatsPerAgent} por agente em média`,
            action: 'Ver chats',
            footer: 'Inclui históricos arquivados',
            icon: MessageCircle,
        },
        {
            title: 'Schemas configurados',
            description: 'Agentes prontos para API',
            value: agentsWithSchema,
            subtext: `${totalAgents - agentsWithSchema} aguardando setup`,
            action: 'Gerenciar schemas',
            footer: 'Recomenda-se 100% configurados',
            icon: FileText,
        },
        {
            title: 'Destaque da semana',
            description: topAgent.name,
            value: topAgent.chats,
            subtext: 'Chats concluídos',
            action: 'Ver desempenho',
            footer: 'Baseado nos últimos 7 dias',
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

