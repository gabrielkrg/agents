import AppLayout from '@/layouts/app-layout';
import { Agent, Chat, type BreadcrumbItem } from '@/types';
import { index, show } from '@/routes/agents';
import { Head } from '@inertiajs/react';
import NewAgentChat from './components/new-agent-chat';
import ListChats from './components/list-chats';
import DeleteAgent from './components/delete-agent';
import EditAgent from './components/edit-agent';


export default function AgentsShow({ agent, chats }: { agent: Agent; chats: Chat[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Agents`,
            href: index().url,
        },
        {
            title: `${agent.name}`,
            href: show(agent.id).url,
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Agent ${agent.name}`} />
            <div className="flex h-full flex-1 flex-col items-center gap-4 overflow-x-auto rounded-xl p-4">
                <div className='max-w-[1000px] w-full'>
                    <div className="flex justify-between mb-5">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold">{agent.name}</h1>
                            <p className="text-sm text-muted-foreground">{agent.description}</p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <EditAgent agent={agent} />
                            <DeleteAgent agent={agent} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">
                        <NewAgentChat agent={agent} />
                        <ListChats agent={agent} chats={chats} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
