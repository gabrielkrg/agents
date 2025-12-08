import { Button } from "@/components/ui/button"
import { Form } from "@inertiajs/react"
import { CheckIcon, Loader2Icon } from "lucide-react"

import {
    AlertDialog,
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
import { Token } from "@/types"

export default function DeleteToken({ token }: { token: Token }) {
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
