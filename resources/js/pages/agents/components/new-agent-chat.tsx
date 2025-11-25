import { Form, Head } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Agent } from '@/types';
import { storeWithMessage } from '@/routes/chats/';

export default function NewAgentChat({ agent }: { agent: Agent }) {
    const [input, setInput] = useState("")

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

                        <div className='flex flex-col gap-2'>
                            <InputGroup>
                                <InputGroupInput
                                    id="content"
                                    name="content"
                                    placeholder="New chat..."
                                    autoComplete="off"
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        disabled={processing}
                                        type="submit"
                                        size="icon-xs"
                                        className="rounded-full"
                                    >
                                        {processing ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon className="size-4" />}
                                        <span className="sr-only">Send</span>
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            <InputError message={errors.content} />
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}