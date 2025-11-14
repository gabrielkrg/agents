import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { store } from '@/routes/agents';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function CreateAgent() {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

    return (

        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>Create</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <Form
                        {...store.form()}
                        className="flex flex-col gap-4"
                        onSuccess={handleSuccess}
                        resetOnSuccess={['name', 'description']}
                    >
                        {({
                            errors,
                            processing,
                            wasSuccessful,
                        }) => (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Create Agent</DialogTitle>
                                    <DialogDescription>
                                        Create a new agent to start chatting with.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name-1">Name</Label>
                                        <Input id="name" name="name" />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            rows={4}
                                        />
                                        <InputError message={errors.description} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <div className="flex items-center gap-2">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating...' : 'Create'}
                                        </Button>
                                        {wasSuccessful && <p className="text-sm text-muted-foreground">Created.</p>}
                                    </div>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}