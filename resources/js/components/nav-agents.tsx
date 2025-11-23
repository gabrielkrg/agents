import { useState, useEffect } from 'react';
import axios from 'axios';
import { Agent, Chat } from '@/types';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { index as agentsIndex } from '@/routes/agents';
import { show } from '@/routes/agents';
import { show as showChat } from '@/routes/chats';
import { FolderClosed, FolderOpen, Folders } from 'lucide-react';
import CreateAgentMenu from '@/components/create-agent-menu';

export default function NavAgents({ showLabel = false }: { showLabel: boolean }) {

    const [agents, setAgents] = useState<Agent[]>([]);

    useEffect(() => {
        axios.get('/api/agents').then((response) => {
            setAgents(response.data);
        });
    }, []);

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
                        <SidebarMenuItem key={agent.id}>
                            <SidebarMenuButton
                                asChild
                                key={agent.id}
                                isActive={window.location.pathname.startsWith(show(agent.id).url)}>

                                <Link href={show(agent.id).url} prefetch>
                                    {
                                        window.location.pathname.startsWith(show(agent.id).url) ||
                                            window.location.pathname.startsWith('/a/' + agent.id + '/c/') ||
                                            window.location.pathname.startsWith(showChat([agent.id, 0]).url) ?
                                            <FolderOpen /> :
                                            <FolderClosed />
                                    }
                                    <span>{agent.name}</span>
                                </Link>

                            </SidebarMenuButton>
                            {agent.chats.map((chat: Chat) => (
                                <SidebarMenuSub key={chat.id}>
                                    <SidebarMenuSubItem >
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={showChat([agent.id, chat.id]).url === window.location.pathname}
                                        >
                                            <Link href={showChat([agent.id, chat.id]).url} prefetch>
                                                <span>{chat.description}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            ))}
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
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