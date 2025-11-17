import AppLayout from '@/layouts/app-layout';
import { Chat, Message, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon } from 'lucide-react';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { show } from '@/routes/chats';
import { show as showAgent } from '@/routes/agents';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-2xl font-semibold mb-3 mt-1">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-semibold mb-2 mt-1">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-1">{children}</h3>,
    p: ({ children }) => <p className="leading-relaxed mb-3 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1 mb-3">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-1 mb-3">{children}</ol>,
    li: ({ children }) => <li className="[&>p]:mb-1 last:[&>p]:mb-0">{children}</li>,
    code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 text-sm">{children}</code>,
    pre: ({ children }) => <pre className="bg-muted rounded-md p-3 text-sm overflow-x-auto mb-3">{children}</pre>,
};

const userMessageClasses = "bg-primary text-primary-foreground ml-auto flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm";
const assistantMessageClasses = "flex w-max max-w-full flex-col gap-2 rounded-lg px-3 py-2 text-sm";

const TypingIndicator = () => (
    <div className="flex items-center text-sm text-muted-foreground">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground animate-bounce" />
    </div>
);

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

function generateAiMessage(agent_id: number, chat_id: number) {
    return axios.post('/api/gemini/generate', {
        agent_id: agent_id,
        chat_id: chat_id,
    }).then((response) => {
        return response.data as { parsed: any, raw: string };
    })
}

export default function ChatShow({ chat, messages, newChat }: { chat: Chat; messages: Message[]; newChat: string | null }) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Agent',
            href: showAgent(chat.agent_id).url,
        },
        {
            title: 'Chat',
            href: show(chat.id).url,
        },
    ];

    const [input, setInput] = useState("")
    const inputLength = input.trim().length
    const [messagesState, setMessagesState] = useState<any[]>(messages)
    const [isGenerating, setIsGenerating] = useState(false)
    const hasGeneratedAiMessage = useRef(false)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messagesState, isGenerating])

    useEffect(() => {
        if (newChat && !hasGeneratedAiMessage.current) {
            hasGeneratedAiMessage.current = true
            setIsGenerating(true)

            generateAiMessage(chat.agent_id, chat.id)
                .then((aiMessage) => {
                    return storeMessage(aiMessage.parsed, 'model', chat.id, chat.agent_id).then((storedAiMessage) => {
                        addMessage(storedAiMessage)
                    })
                })
                .finally(() => {
                    setIsGenerating(false)
                })
        }
    }, [newChat, chat.agent_id, chat.id])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (inputLength === 0 || isGenerating) return

        const currentInput = input
        setInput('')
        setIsGenerating(true)

        try {
            const userMessage = await storeMessage(currentInput, 'user', chat.id, chat.agent_id)
            addMessage(userMessage)

            const aiMessage = await generateAiMessage(chat.agent_id, chat.id)
            const storedAiMessage = await storeMessage(aiMessage.parsed, 'model', chat.id, chat.agent_id)
            addMessage(storedAiMessage)
        } catch (error) {
            console.error('Failed to send message', error)
        } finally {
            setIsGenerating(false)
        }
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

                <div id="messages-container" className="flex flex-col gap-4 w-full pb-25">
                    {messagesState.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                message.role === "user"
                                    ? userMessageClasses
                                    : assistantMessageClasses
                            )}
                        >
                            {message.role === "user" ? (
                                message.content
                            ) : (
                                <div className="max-w-full">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={markdownComponents}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ))}
                    {isGenerating && (
                        <div className={assistantMessageClasses}>
                            <TypingIndicator />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
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
                                disabled={isGenerating}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    type="submit"
                                    size="icon-sm"
                                    className="rounded-full"
                                    disabled={isGenerating || inputLength === 0}
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
