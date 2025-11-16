import AppLayout from '@/layouts/app-layout';
import { Chat, Message, type BreadcrumbItem } from '@/types';
import { index } from '@/routes/chats';
import { Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon } from 'lucide-react';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { useState, useEffect } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Chats',
        href: index().url,
    },
];

function storeMessage(message: string, role: string, chat_id: number, agent_id: number) {
    return axios.post('/api/messages', {
        content: message,
        role: role,
        chat_id: chat_id,
        agent_id: agent_id,
    }).then((response) => {
        return response.data as Message;
    })
}

function generateAiMessage(content: string) {
    return axios.post('/api/ai/generate', {
        content: content,
    }).then((response) => {
        return response.data as Message;
    })
}

export default function ChatShow({ chat, messages, newChat }: { chat: Chat; messages: Message[]; newChat: boolean | null }) {
    const [input, setInput] = useState("")
    const inputLength = input.trim().length
    const [messagesState, setMessagesState] = useState<any[]>(messages)

    function addMessage(message: Message) {
        setMessagesState((prev) => [
            ...prev,
            {
                id: message.id,
                role: message.role,
                content: message.content,
            },
        ])
    }

    useEffect(() => {
        if (newChat) {
            storeMessage(messagesState[0].content, 'user', chat.id, chat.agent_id).then((message) => {
                addMessage(message)
            });
        }
    }, [newChat])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (inputLength === 0) return

        storeMessage(input, 'user', chat.id, chat.agent_id)
            .then((userMessage) => {
                addMessage(userMessage)

                generateAiMessage(userMessage.content).then((aiMessage) => {
                    storeMessage(aiMessage.content, 'model', chat.id, chat.agent_id).then((aiMessage) => {
                        addMessage(aiMessage)
                    })
                })
            })
            .catch((error) => {
                console.error(error)
            })
            .finally(() => {
                setInput("")
            })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat ${chat.description}`} />
            <div className="relative flex mx-auto w-full max-w-[1000px] h-full flex-1 flex-col items-center gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between mb-5">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold">{chat.description}</h1>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full pb-25">
                    {messagesState.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground ml-auto"
                                    : "bg-muted"
                            )}
                        >
                            {message.content}
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-15 w-full max-w-[1000px]">
                    <form
                        onSubmit={handleSubmit}
                        className="relative w-full"
                    >
                        <InputGroup className="!bg-background rounded-full">
                            <InputGroupInput
                                id="message"
                                placeholder="Type your message..."
                                autoComplete="off"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    type="submit"
                                    size="icon-sm"
                                    className="rounded-full"
                                >
                                    <ArrowUpIcon />
                                    <span className="sr-only">Send</span>
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
