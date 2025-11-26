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
import { CheckIcon, Loader2Icon } from "lucide-react"
import InputError from "./input-error"

export default function CreateToken() {
    return (

        <Dialog>
            <DialogTrigger asChild>
                <Button>Create</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form
                    {...store.form()}
                    className="flex flex-col gap-4"
                    resetOnSuccess={['name']}

                >
                    {({
                        errors,
                        processing,
                        wasSuccessful,
                    }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Create Token</DialogTitle>
                                <DialogDescription>
                                    Create a new token to use in your applications.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" />
                                    <InputError message={errors.name} />
                                </div>

                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing ? <Loader2Icon className="size-4 animate-spin" /> : ''}
                                    {wasSuccessful ? <CheckIcon className="size-4" /> : ''}
                                    Create
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    )
}
