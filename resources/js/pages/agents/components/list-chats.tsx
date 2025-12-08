import { Agent, Chat } from "@/types";
import { router } from "@inertiajs/react";
import { show } from "@/routes/chats";
import { Button } from "@/components/ui/button";
import { CheckIcon, Loader2Icon, MessageCircleOffIcon, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@/components/ui/dialog";
import { Form } from "@inertiajs/react";
import { update, destroy } from "@/routes/chats/";
import InputError from "@/components/input-error";
import { useState } from "react";

function EditChat({ chat }: { chat: Chat }) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form
                    {...update.form({ chat: chat.uuid })}
                    className="flex flex-col gap-4"
                    onSuccess={handleSuccess}
                    resetOnSuccess={['description']}
                >
                    {({
                        errors,
                        processing,
                        wasSuccessful,
                    }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit chat</DialogTitle>
                                <DialogDescription>
                                    Make changes to your chat here. Click save when you&apos;re
                                    done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" name="description" defaultValue={chat.description} />
                                    <InputError message={errors.description} />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing ? <Loader2Icon className="size-4 animate-spin" /> : ''}
                                    {wasSuccessful ? <CheckIcon className="size-4" /> : ''}
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                </Form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteChat({ chat }: { chat: Chat }) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" type="button">
                    <Trash className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <Form {...destroy.form({ chat: chat.uuid })} onSuccess={handleSuccess}>
                        {({
                            errors,
                            processing,
                            wasSuccessful,
                        }) => (
                            <>
                                <InputError message={errors.description} />
                                <Button type="submit" disabled={processing} variant="destructive">
                                    {processing ? <Loader2Icon className="size-4 animate-spin" /> : ''}
                                    {wasSuccessful ? <CheckIcon className="size-4" /> : ''}
                                    Delete
                                </Button>
                            </>
                        )}
                    </Form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function ListChats({ agent, chats }: { agent: Agent, chats: Chat[] }) {
    return (
        chats.length > 0 ? (
            <div className="flex flex-col gap-2">
                <h2 className="text-sm text-muted-foreground">Chats</h2>
                <div className="flex flex-col divide-y divide-foreground/10" >
                    {
                        chats.map((chat) => (
                            <div
                                key={chat.uuid}
                                className='group relative cursor-pointer flex justify-between items-center hover:bg-foreground/10 p-4'
                                onClick={() => router.visit(show([agent.uuid, chat.uuid]))}
                            >
                                <span
                                    className="text-sm flex-1"
                                    onClick={() => router.visit(show([agent.uuid, chat.uuid]))}
                                >
                                    {chat.description}
                                </span>

                                <div
                                    className="flex gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <EditChat chat={chat} />
                                    <DeleteChat chat={chat} />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        ) : (
            <div className="flex flex-col gap-2 justify-center items-center h-full">
                <MessageCircleOffIcon className="size-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Nothing here yet</p>
            </div>
        )
    );
}