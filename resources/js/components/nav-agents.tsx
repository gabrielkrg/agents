import { Agent, Chat, SharedData } from '@/types';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { index as agentsIndex } from '@/routes/agents';
import { show } from '@/routes/agents';
import { show as showChat } from '@/routes/chats';
import { FolderClosed, FolderOpen, Folders } from 'lucide-react';
import CreateAgentMenu from '@/components/create-agent-menu';

export default function NavAgents({ showLabel = false }: { showLabel: boolean }) {

    const { agents = [] } = usePage<SharedData>().props;

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel className={showLabel ? 'block' : 'hidden'}>Agents</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <CreateAgentMenu />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {agents.map((agent: Agent) => (
                        <SidebarMenuItem key={agent.uuid}>
                            <SidebarMenuButton
                                asChild
                                key={agent.uuid}
                                isActive={window.location.pathname === show(agent.uuid).url}
                                tooltip={{ children: agent.name }}
                            >

                                <Link href={show(agent.uuid).url} prefetch>
                                    {
                                        window.location.pathname.startsWith(show(agent.uuid).url) ||
                                            window.location.pathname.startsWith('/a/' + agent.uuid + '/c/') ||
                                            window.location.pathname.startsWith(showChat([agent.uuid, { uuid: '0' }]).url) ?
                                            <FolderOpen /> :
                                            <FolderClosed />
                                    }
                                    <span>{agent.name}</span>

                                </Link>

                            </SidebarMenuButton>
                            {agent.chats.map((chat: Chat) => (
                                <SidebarMenuSub key={chat.uuid}>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={showChat([agent.uuid, chat.uuid]).url === window.location.pathname}
                                        >

                                            <Link href={showChat([agent.uuid, chat.uuid]).url} prefetch>
                                                <span>{chat.description}</span>
                                            </Link>

                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            ))}
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={window.location.pathname === agentsIndex().url}
                            tooltip={{ children: 'All agents' }}
                        >
                            <Link href={agentsIndex().url} prefetch>
                                <Folders />
                                <span>All agents</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

            </SidebarGroup>
        </>
    );
}