import { Agent } from '@/types';
import { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Form } from '@inertiajs/react';
import { destroy } from '@/routes/agents';
import { CheckIcon, Loader2Icon } from 'lucide-react';

export default function DeleteAgent({ agent }: { agent: Agent }) {
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
                    <Form {...destroy.form({ agent: agent.uuid })} onSuccess={handleSuccess}>
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