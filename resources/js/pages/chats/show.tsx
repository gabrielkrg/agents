import AppLayout from '@/layouts/app-layout';
import { Chat, Message, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { handleTextareaKeyDown } from '@/lib/utils';
import { ArrowDownIcon, ArrowUp, Loader2Icon, Plus } from 'lucide-react';
import { InputGroup, InputGroupTextarea, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { show } from '@/routes/chats';
import { index, show as showAgent } from '@/routes/agents';
import { useState, useEffect, useRef, memo, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from "react-markdown";
import { Button } from '@/components/ui/button';

export const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-2xl font-semibold mb-3 mt-1">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-semibold mb-2 mt-1">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-1">{children}</h3>,
    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1 mb-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-1 mb-4">{children}</ol>,
    li: ({ children }) => <li className="[&>p]:mb-1 last:[&>p]:mb-0 mt-4">{children}</li>,
    code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 text-sm">{children}</code>,
    pre: ({ children }) => <pre className="bg-muted rounded-md p-3 text-sm overflow-x-auto mb-3">{children}</pre>,
};

export const userMessageClasses = "bg-primary whitespace-pre-wrap !text-[16px] leading-5 text-primary-foreground ml-auto flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2";
export const assistantMessageClasses = "flex w-max max-w-full flex-col gap-2 rounded-lg px-3 py-2 !text-[17px] leading-7";

export const TypingIndicator = () => (
    <div className="flex items-center text-sm text-muted-foreground">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground animate-bounce" />
    </div>
);

function storeMessage(message: string, role: string, chat_uuid: string, agent_uuid: string) {
    return axios.post('/api/messages', {
        content: message,
        role: role,
        chat_uuid: chat_uuid,
        agent_uuid: agent_uuid,
    }).then((response) => {
        return response.data as Message;
    })
}

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 90000;

function fetchChatMessages(chat_uuid: string) {
    return axios.get<MessageChat[]>(`/api/chats/${chat_uuid}/messages`).then((res) => res.data);
}

function generateAiResponse(agent_uuid: string, chat_uuid: string) {
    return axios.post('/api/gemini/generate', {
        agent_uuid: agent_uuid,
        chat_uuid: chat_uuid,
    });
}

function pollUntilModelMessage(
    chatUuid: string,
    initialLength: number,
    setMessagesChat: React.Dispatch<React.SetStateAction<MessageChat[]>>,
    setIsGenerating: (v: boolean) => void,
): () => void {
    let cancelled = false;
    let timeoutId: number;
    let intervalId: number;
    const stop = () => {
        cancelled = true;
        clearTimeout(timeoutId);
        clearInterval(intervalId);
    };
    timeoutId = window.setTimeout(() => {
        stop();
        setIsGenerating(false);
    }, POLL_TIMEOUT_MS);
    intervalId = window.setInterval(() => {
        if (cancelled) return;
        fetchChatMessages(chatUuid)
            .then((messages) => {
                if (
                    cancelled ||
                    messages.length <= initialLength ||
                    messages[messages.length - 1].role !== 'model'
                ) {
                    return;
                }
                stop();
                setMessagesChat(
                    messages.map((m) => ({ uuid: m.uuid, role: m.role, content: m.content })),
                );
                setIsGenerating(false);
            })
            .catch(() => {});
    }, POLL_INTERVAL_MS);
    return stop;
}

const ChatMessage = memo(({ message }: { message: MessageChat }) => {
    return (
        <div
            className={cn(message.role === "user"
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

export interface MessageChat {
    uuid: string;
    role: "user" | "model";
    content: string;
}

export default function ChatShow({ chat, messages, newChat }: { chat: Chat; messages: Message[]; newChat: string | null }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Agents',
            href: index().url,
        },
        {
            title: chat.agent_name,
            href: showAgent(chat.agent_uuid).url,
        },
        {
            title: `${chat.description}`,
            href: show([chat.agent_uuid, chat.uuid]).url,
        },
    ];

    const [input, setInput] = useState("")
    const inputLength = input.trim().length

    const [messagesChat, setMessagesChat] = useState<MessageChat[]>(messages)
    const [isGenerating, setIsGenerating] = useState(false)
    const hasGeneratedAiMessage = useRef(false)
    const [isDesktop, setIsDesktop] = useState(false)
    const [isAtBottom, setIsAtBottom] = useState(true)

    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const formRef = useRef<HTMLDivElement | null>(null)
    const pollCleanupRef = useRef<(() => void) | null>(null)
    const [formHeight, setFormHeight] = useState(0)

    useEffect(() => {
        const updateFormHeight = () => {
            if (formRef.current) {
                setFormHeight(formRef.current.offsetHeight)
            }
        }

        updateFormHeight()
        window.addEventListener('resize', updateFormHeight)

        // Observar mudanças no tamanho do formulário
        const resizeObserver = new ResizeObserver(updateFormHeight)
        if (formRef.current) {
            resizeObserver.observe(formRef.current)
        }

        return () => {
            window.removeEventListener('resize', updateFormHeight)
            resizeObserver.disconnect()
        }
    }, [])

    const updateIsAtBottom = useCallback(() => {
        if (!messagesEndRef.current) return

        const rect = messagesEndRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight
        setIsAtBottom(rect.bottom <= viewportHeight + 8)
    }, [])

    function addMessage(message: Message) {
        setMessagesChat((prev) => [
            ...prev,
            {
                uuid: message.uuid,
                role: message.role,
                content: message.content,
            },
        ])
    }

    const scrollToBottom = (smooth: boolean = true) => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: smooth ? 'smooth' : 'auto',

                block: 'end'
            })

            setIsAtBottom(true)
        })
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom(false)
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const updateIsDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024)
        }

        updateIsDesktop()
        window.addEventListener('resize', updateIsDesktop)

        return () => window.removeEventListener('resize', updateIsDesktop)
    }, [])

    useEffect(() => {
        updateIsAtBottom()
        window.addEventListener('scroll', updateIsAtBottom, { passive: true })

        return () => window.removeEventListener('scroll', updateIsAtBottom)
    }, [updateIsAtBottom])

    useEffect(() => {
        updateIsAtBottom()
    }, [messagesChat.length, updateIsAtBottom])

    useEffect(() => {
        return () => {
            pollCleanupRef.current?.();
            pollCleanupRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!newChat || hasGeneratedAiMessage.current) return;

        hasGeneratedAiMessage.current = true;
        setIsGenerating(true);

        generateAiResponse(chat.agent_uuid, chat.uuid)
            .then((response) => {
                if (response.status === 202) {
                    pollCleanupRef.current = pollUntilModelMessage(
                        chat.uuid,
                        messagesChat.length,
                        setMessagesChat,
                        setIsGenerating,
                    );
                } else {
                    setIsGenerating(false);
                }
            })
            .catch(() => {
                setIsGenerating(false);
            });

        return () => {
            pollCleanupRef.current?.();
            pollCleanupRef.current = null;
        };
    }, [newChat, chat.agent_uuid, chat.uuid, messagesChat.length])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (inputLength === 0 || isGenerating) return;

        const currentInput = input;
        setInput('');
        setIsGenerating(true);

        try {
            const storedUserMessage = await storeMessage(
                currentInput,
                'user',
                chat.uuid,
                chat.agent_uuid,
            );
            addMessage(storedUserMessage);
            scrollToBottom(true);

            const response = await generateAiResponse(chat.agent_uuid, chat.uuid);
            if (response.status === 202) {
                pollCleanupRef.current?.();
                pollCleanupRef.current = pollUntilModelMessage(
                    chat.uuid,
                    messagesChat.length + 1,
                    setMessagesChat,
                    setIsGenerating,
                );
            } else {
                setIsGenerating(false);
            }
        } catch (error) {
            console.error('Failed to send message', error);
            setIsGenerating(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat ${chat.description}`} />
            <div
                className="overflow-y-auto w-full"
                style={{ maxHeight: `calc(100vh - 90px - ${formHeight}px)` }}
            >
                <div className="flex justify-center mb-5 hidden">
                    <h1 className="text-2xl font-bold">{chat.description}</h1>
                </div>

                <div className="px-4 mt-5 max-w-[1000px] w-full mx-auto">
                    <div id="messages-container" className="flex flex-col gap-4 w-full pb-25 overflow-hidden">
                        {messagesChat.map((message) => (
                            <ChatMessage key={message.uuid} message={message} />
                        ))}
                        {isGenerating && (
                            <div className={assistantMessageClasses}>
                                <TypingIndicator />
                            </div>
                        )}
                    </div>

                    <div ref={messagesEndRef} />

                    <Button
                        variant="default"
                        size="icon"
                        onClick={() => scrollToBottom(true)}
                        className={cn(
                            "fixed border border-foreground/10 shadow-sm md:bottom-10 right-0 bottom-30 z-10 rounded-full -translate-x-1/2 transition-all duration-200 ease-out",
                            isAtBottom
                                ? "opacity-0 pointer-events-none translate-y-4"
                                : "opacity-100 pointer-events-auto translate-y-0"
                        )}
                    >
                        <ArrowDownIcon className="size-4" />
                    </Button>
                </div>
            </div>
            <div ref={formRef} className="w-full max-w-[1000px] w-full mx-auto bg-background px-4">
                <form
                    onSubmit={handleSubmit}
                    className="relative w-full"
                >
                    <InputGroup className="bg-transparent rounded-3xl pr-1 shadow-sm flex items-end">
                        <InputGroupAddon >
                            <InputGroupButton
                                type="button"
                                size="icon-sm"
                                className="rounded-full"
                                variant="ghost"
                                disabled={isGenerating}
                            >
                                <Plus className="size-4" />
                                <span className="sr-only">Add</span>
                            </InputGroupButton>
                        </InputGroupAddon>

                        <InputGroupTextarea
                            id="message"
                            placeholder="Type your message..."
                            autoComplete="off"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            // disabled={isGenerating}
                            rows={1}
                            onKeyDown={isDesktop ? handleTextareaKeyDown : undefined}
                            className="min-h-0 text-base max-h-50"
                        />

                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                type="submit"
                                size="icon-sm"
                                className="rounded-full"
                                variant="default"
                                disabled={isGenerating}
                            >
                                {isGenerating ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
                                <span className="sr-only">Send</span>
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </form>
            </div>
        </AppLayout>
    );
}
