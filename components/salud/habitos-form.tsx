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
import { addHabit } from '@/app/(app)/actions/salud'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function HabitosForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addHabit(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Nuevo hábito creado')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Hábito
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-emerald-500/30">
                <DialogHeader>
                    <DialogTitle>Crear Tracker de Hábito</DialogTitle>
                    <DialogDescription>
                        Configura un nuevo hábito diario o semanal para trackear.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Hábito a implementar</Label>
                        <Input id="name" name="name" placeholder="Ej: Beber 2L de agua, Leer 10 pág..." required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time_of_day">Momento del Día</Label>
                        <Select name="time_of_day" defaultValue="any">
                            <SelectTrigger>
                                <SelectValue placeholder="Día" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="morning">Rutina de Mañana</SelectItem>
                                <SelectItem value="afternoon">Tarde</SelectItem>
                                <SelectItem value="evening">Rutina de Noche</SelectItem>
                                <SelectItem value="any">En cualquier momento</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-500 text-white hover:bg-emerald-600">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Hábito
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
