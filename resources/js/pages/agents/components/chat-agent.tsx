import { Button } from '@/components/ui/button';
import { Agent } from '@/types';
import { MessageCircle } from 'lucide-react';

export default function ChatAgent({ agent }: { agent: Agent }) {
    const handleChat = (agent: Agent) => () => {
        console.log('Chatting with agent', agent);
    };

    return (
        <Button variant="outline" size="icon" type="button" onClick={handleChat(agent)}>
            <MessageCircle className="size-4" />
        </Button>
    );
}