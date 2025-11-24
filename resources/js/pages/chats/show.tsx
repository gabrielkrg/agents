import AppLayout from '@/layouts/app-layout';
import { Chat, Message, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { show } from '@/routes/chats';
import { index, show as showAgent } from '@/routes/agents';
import { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from "react-markdown";

export const markdownComponents: Components = {
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

export const userMessageClasses = "bg-primary text-primary-foreground ml-auto flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm";
export const assistantMessageClasses = "flex w-max max-w-full flex-col gap-2 rounded-lg px-3 py-2 text-sm";

export const TypingIndicator = () => (
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

function generateAiResponse(agent_id: number, chat_id: number) {
    return axios.post('/api/gemini/generate', {
        agent_id: agent_id,
        chat_id: chat_id,
    }).then((response) => {
        return response.data as { parsed: any, raw: string };
    })
}

const ChatMessage = memo(({ message }: { message: { id: number; role: string; content: string } }) => {
    return (
        <div
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
    );
});

ChatMessage.displayName = 'ChatMessage';

export default function ChatShow({ chat, messages, newChat }: { chat: Chat; messages: Message[]; newChat: string | null }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Agents',
            href: index().url,
        },
        {
            title: chat.agent_name,
            href: showAgent(chat.agent_id).url,
        },
        {
            title: `${chat.description}`,
            href: show([chat.agent_id, chat.id]).url,
        },
    ];

    const [input, setInput] = useState("")
    const inputLength = input.trim().length

    const [messagesChat, setMessagesChat] = useState<any[]>(messages)
    const [isGenerating, setIsGenerating] = useState(false)
    const hasGeneratedAiMessage = useRef(false)

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    function addMessage(message: Message) {
        setMessagesChat((prev) => [
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
    }, [messagesChat, isGenerating])

    useEffect(() => {
        if (newChat && !hasGeneratedAiMessage.current) {
            hasGeneratedAiMessage.current = true
            setIsGenerating(true)

            generateAiResponse(chat.agent_id, chat.id).then((aiResponse) => {
                return storeMessage(aiResponse.parsed, 'model', chat.id, chat.agent_id).then((storedAiMessage) => {
                    addMessage(storedAiMessage)
                })
            }).catch((error) => {
                console.error('Failed to generate AI response', error)
            }).finally(() => {
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
            // store user message
            const storedUserMessage = await storeMessage(currentInput, 'user', chat.id, chat.agent_id)
            addMessage(storedUserMessage)

            // generate ai response
            const aiResponse = await generateAiResponse(chat.agent_id, chat.id)
            // store ai response
            const storedAiResponse = await storeMessage(aiResponse.parsed, 'model', chat.id, chat.agent_id)
            addMessage(storedAiResponse)
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
                    {messagesChat.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                    {isGenerating && (
                        <div className={assistantMessageClasses}>
                            <TypingIndicator />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="fixed bottom-0 w-full max-w-[1000px] bg-background pb-10 px-4">
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
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon className="size-4" />}
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
