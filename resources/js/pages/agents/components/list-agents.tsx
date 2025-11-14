import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableFooter
} from '@/components/ui/table';

import { Agent } from '@/types';
import { Ellipsis, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatAgent from './chat-agent';

export default function ListAgents({ agents }: { agents: Agent[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {agents.map((agent) => (
                    <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{agent.description}</TableCell>
                        <TableCell>{agent.count}</TableCell>
                        <TableCell className='flex justify-end gap-2'>
                            <ChatAgent agent={agent} />
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