import { Agent } from '@/types';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const chartColors = [
    '#1A7F7F',
    '#599E9E',
    '#106060',
    '#70B9D6',
    '#A3D6A3',
    '#D4D4C8',
    '#3C4A5A',
    '#FBFBF6',
    '#D0D4D8',
    '#E0C0B0',
];


type ChartDatum = {
    name: string;
    value: number;
    color: string;
};

type ChartTooltipPayload = {
    name?: string;
    value?: number;
    percent?: number;
    payload?: ChartDatum;
};

type ChartTooltipProps = {
    active?: boolean;
    payload?: ChartTooltipPayload[];
};

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload?.length) {
        return null;
    }

    const { name, value, payload: dataPoint, percent } = payload[0];

    return (
        <div className="rounded-xl border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
            <p className="font-semibold">{name}</p>
            <div className="mt-1 h-1.5 rounded-full" style={{ background: dataPoint?.color }} />
        </div>
    );
};

export default function AgentsPieChart({ agents }: { agents: Agent[] }) {
    const chartData: ChartDatum[] = agents.map((agent, index) => ({
        name: agent.name,
        value: agent.count ?? agent.chats?.length ?? 0,
        color: chartColors[index % chartColors.length],
    }));

    const hasChartData = chartData.some((data) => data.value > 0);
    const legendItems = chartData
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);
    const totalChats = chartData.reduce((acc, data) => acc + data.value, 0);

    if (!hasChartData) {
        return (
            <p className="text-sm text-muted-foreground">
                Nenhum chat encontrado para os agentes.
            </p>
        );
    }

    return (
        <div className="flex h-full flex-col gap-4">

            <div className="flex flex-col gap-6 md:flex-row">
                <div
                    className="relative flex-1 p-6 text-white md:h-auto"
                    tabIndex={-1}
                >
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart
                            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                            tabIndex={-1}
                        >
                            <Tooltip content={<ChartTooltip />} />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={90}
                                outerRadius={110}
                                paddingAngle={1}
                                startAngle={90}
                                endAngle={-270}
                                stroke="transparent"
                                cornerRadius={0}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-4xl font-semibold">{totalChats}</p>
                        <p className="text-sm text-slate-400">Chats</p>
                    </div>
                </div>
                <div className="grid flex-1 gap-2 rounded-3xl border border-border/70 bg-muted/20 p-4 text-sm md:w-56">
                    {legendItems.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between rounded-2xl bg-background/70 px-3 py-2 shadow-sm ring-1 ring-border/50"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <p className="font-medium truncate max-w-[120px]">{item.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {totalChats ? `${((item.value / totalChats) * 100).toFixed(0)}%` : '0%'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

