import { Form, Head } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ArrowUp, Loader2Icon } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Agent } from '@/types';
import { storeWithMessage } from '@/routes/chats/';
import { handleTextareaKeyDown } from '@/lib/utils';

export default function NewAgentChat({ agent }: { agent: Agent }) {
    const [input, setInput] = useState("")
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        const updateIsDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024)
        }

        updateIsDesktop()
        window.addEventListener('resize', updateIsDesktop)

        return () => window.removeEventListener('resize', updateIsDesktop)
    }, [])

    return (
        <>
            <Form
                {...storeWithMessage.form()}
                resetOnSuccess={['content']}
            >
                {({
                    errors,
                    processing,
                }) => (
                    <>
                        <div className="flex flex-col gap-2 hidden">
                            <Label htmlFor="agent_uuid">Agent UUID</Label>
                            <Input type="hidden" id='agent_uuid' name='agent_uuid' value={agent.uuid} />
                            <InputError message={errors.agent_uuid} />
                        </div>

                        <InputGroup className="bg-transparent !rounded-3xl pl-5 pr-1">
                            <InputGroupTextarea
                                id="content"
                                name="content"
                                placeholder="Type your message..."
                                autoComplete="off"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                rows={1}
                                onKeyDown={isDesktop ? handleTextareaKeyDown : undefined}
                                className="min-h-0 text-base"
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    disabled={processing}
                                    type="submit"
                                    size="icon-sm"
                                    className="rounded-full"
                                    variant="default"
                                >
                                    {processing ?
                                        <Loader2Icon className="size-4 animate-spin" /> :
                                        <ArrowUp className="size-4" />
                                    }
                                    <span className="sr-only">Send</span>
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        <InputError message={errors.content} />
                    </>
                )}
            </Form>
        </>
    );
}