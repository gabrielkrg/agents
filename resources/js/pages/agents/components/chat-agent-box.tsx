import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { useState } from 'react';
import { Agent } from '@/types';
import { ArrowUpIcon, EraserIcon, MinusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';

export default function ChatAgentBox({ agent, open, setOpen }: { agent: Agent; open: boolean; setOpen: (open: boolean) => void }) {

    const [messages, setMessages] = useState([
        {
            role: "agent",
            content: "Hi, how can I help you today?",
        },
        {
            role: "user",
            content: "Hey, I'm having trouble with my account.",
        },
        {
            role: "agent",
            content: "What seems to be the problem?",
        },
        {
            role: "user",
            content: "I can't log in.",
        },
    ])

    const [input, setInput] = useState("")
    const inputLength = input.trim().length

    return (
        <>
            <Card className={cn("fixed bottom-8 right-8 w-[500px] h-[600px]", open ? "block" : "hidden")}>
                <CardHeader className="flex flex-col justify-between gap-2">
                    <div className="flex items-start gap-4 justify-between w-full">
                        <div className="flex flex-col gap-0.5">
                            <Heading
                                title={agent.name}
                                description={agent.description}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" type="button" onClick={() => setOpen(false)}>
                                <EraserIcon className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" type="button" onClick={() => setOpen(false)}>
                                <MinusIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
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
                </CardContent>
                <CardFooter>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            if (inputLength === 0) return
                            setMessages([
                                ...messages,
                                {
                                    role: "user",
                                    content: input,
                                },
                            ])
                            setInput("")
                        }}
                        className="relative w-full"
                    >
                        <InputGroup>
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
                                    size="icon-xs"
                                    className="rounded-full"
                                >
                                    <ArrowUpIcon />
                                    <span className="sr-only">Send</span>
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </form>
                </CardFooter>
            </Card>
        </>
    );
}