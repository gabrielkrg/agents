import { Chat } from "@/types";
import { Link } from "@inertiajs/react";
import { show } from "@/routes/chats";
import { Button } from "@/components/ui/button";
import { Ellipsis, MessageCircleOffIcon } from "lucide-react";

export default function ListChats({ chats }: { chats: Chat[] }) {
    return (
        chats.length > 0 ? (
            <div className="flex flex-col gap-1" >
                <h2 className="text-sm text-muted-foreground">Chats</h2>
                {
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className='relative flex justify-between items-center hover:bg-foreground/10 rounded-md border border-foreground/10'
                        >
                            <Link
                                href={show(chat.id)}
                                key={chat.id}
                                className="text-sm flex-1 px-2 py-5">
                                {chat.description}
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                className="pointer-events-auto relative z-10 pr-2">
                                <Ellipsis className="size-4" />
                            </Button>
                        </div>
                    ))
                }
            </div>
        ) : (
            <div className="flex flex-col gap-2 justify-center items-center h-full">
                <MessageCircleOffIcon className="size-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Nothing here yet</p>
            </div>
        )
    );
}