import AppLayout from '@/layouts/app-layout';
import { Agent, Chat, type BreadcrumbItem } from '@/types';
import { index } from '@/routes/agents';
import { Form, Head } from '@inertiajs/react';
import NewAgentChat from './components/new-agent-chat';
import ListChats from './components/list-chats';
import { Button } from '@/components/ui/button';
import { CheckIcon, Loader2Icon, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog, AlertDialogDescription, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import InputError from '@/components/input-error';
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { destroy, update } from '@/routes/agents';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: `Agent`,
        href: index().url,
    },
];

function EditAgent({ agent }: { agent: Agent }) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" type="button" size="icon">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...update.form({ agent: agent.id })} className="flex flex-col gap-4" onSuccess={handleSuccess}>
                    {({
                        errors,
                        processing,
                        wasSuccessful,
                    }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Agent</DialogTitle>
                                <DialogDescription>
                                    Make changes to your agent here. Click save when you&apos;re
                                    done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" defaultValue={agent.name} />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" rows={4} defaultValue={agent.description} />
                                    <InputError message={errors.description} />
                                </div>
                            </div>
                            <DialogFooter>
                                <div className="flex items-center gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? <Loader2Icon className="size-4 animate-spin" /> : ''}
                                        {wasSuccessful ? <CheckIcon className="size-4" /> : ''}
                                        Create
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteAgent({ agent }: { agent: Agent }) {
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
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Form {...destroy.form({ agent: agent.id })} onSuccess={handleSuccess}>
                        {({
                            processing,
                            wasSuccessful,
                        }) => (
                            <>
                                <Button type="submit" variant="destructive" disabled={processing}>
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

export default function AgentsShow({ agent, chats }: { agent: Agent; chats: Chat[] }) {


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Agent ${agent.name}`} />
            <div className="flex h-full flex-1 flex-col items-center gap-4 overflow-x-auto rounded-xl p-4">
                <div className='max-w-[1000px] w-full'>
                    <div className="flex justify-between mb-5">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold">{agent.name}</h1>
                            <p className="text-sm text-muted-foreground">{agent.description}</p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <EditAgent agent={agent} />
                            <DeleteAgent agent={agent} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">
                        <NewAgentChat agent={agent} />
                        <ListChats chats={chats} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
