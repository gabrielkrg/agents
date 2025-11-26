import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form } from "@inertiajs/react"
import { store } from "@/routes/tokens"
import { CheckIcon, Loader2Icon, Trash } from "lucide-react"
import InputError from "./input-error"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { destroy } from "@/routes/tokens"



export default function DeleteToken({ token }: { token: any }) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="link">Delete</Button>
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
                    <Form {...destroy.form({ id: token.id })} onSuccess={handleSuccess}>
                        {({
                            processing,
                            wasSuccessful,
                        }) => (
                            <>
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
    )
}
