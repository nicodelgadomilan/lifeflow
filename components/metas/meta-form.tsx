'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addGoal } from '@/app/(app)/actions/metas'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function MetaForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addGoal(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Meta creada con éxito')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Meta / Proyecto
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-primary/30">
                <DialogHeader>
                    <DialogTitle>Trazar nuevo objetivo</DialogTitle>
                    <DialogDescription>
                        Define qué quieres lograr y un plazo si aplica.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Objetivo</Label>
                        <Input id="title" name="title" placeholder="Ej: Aprender Francés B1, Ahorrar para viaje..." required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select name="type" defaultValue="goal">
                            <SelectTrigger>
                                <SelectValue placeholder="Clasificación" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="goal">Meta Personal (Resultado a lograr)</SelectItem>
                                <SelectItem value="project">Proyecto (Requiere varias tareas)</SelectItem>
                                <SelectItem value="idea">Idea (Inspiración a futuro)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="target_date">Fecha Límite Deseada (Opcional)</Label>
                        <Input id="target_date" name="target_date" type="date" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Propósito / Descripción Breve</Label>
                        <Input id="description" name="description" placeholder="¿Por qué o para qué quieres hacer esto?" />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
