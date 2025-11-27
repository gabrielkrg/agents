import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
} from '@/components/ui/table';

import { Agent } from '@/types';
import { Ellipsis, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/agents';
import { Link, router } from '@inertiajs/react';

export default function ListAgents({ agents }: { agents: Agent[] }) {
    return (
        <Table>
            <TableCaption>A list of last 10 agents.</TableCaption>

            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {agents.map((agent) => (
                    <TableRow
                        key={agent.uuid}
                        className='hover:bg-foreground/10 cursor-pointer'
                        onClick={() => router.visit(show(agent.uuid))}
                    >
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{agent.description}</TableCell>
                        <TableCell>{agent.count}</TableCell>
                        <TableCell className='flex justify-end gap-2'>
                            {/* <ChatAgent agent={agent} /> */}

                            <Button variant="outline" size="icon" type="button" asChild>
                                <Link href={show(agent.uuid)} >
                                    <MessageCircle className="size-4" />
                                </Link>
                            </Button>

                            <Button variant="outline" size="icon" type="button">
                                <Ellipsis className="size-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>

        </Table>
    );
}