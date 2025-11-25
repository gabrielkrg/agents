import { Agent } from '@/types';
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Form } from '@inertiajs/react';
import { update } from '@/routes/agents';
import { CheckIcon, Loader2Icon } from 'lucide-react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function EditAgent({ agent }: { agent: Agent }) {
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
                <Form {...update.form({ agent: agent.uuid })} className="flex flex-col gap-4" onSuccess={handleSuccess}>
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
                                        Save
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