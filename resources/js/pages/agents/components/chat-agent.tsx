import { Button } from '@/components/ui/button';
import { Agent } from '@/types';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import ChatAgentBox from './chat-agent-box';

export default function ChatAgent({ agent }: { agent: Agent }) {
    const [open, setOpen] = useState(false);

    const handleChat = () => {
        setOpen(true);
    };

    return (
        <>
            {/* <ChatAgentBox agent={agent} open={open} setOpen={setOpen} /> */}

            <Button variant="outline" size="icon" type="button" onClick={handleChat}>
                <MessageCircle className="size-4" />
            </Button>
        </>
    );
}