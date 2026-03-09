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
import { addSportClass } from '@/app/(app)/actions/deportes'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SportClassForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addSportClass(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Clase añadida con éxito')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary/10 text-primary hover:bg-primary/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Clase
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-primary/30">
                <DialogHeader>
                    <DialogTitle>Nueva Clase Fija</DialogTitle>
                    <DialogDescription>
                        Registra una clase a la que asistas recurrentemente.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Actividad</Label>
                        <Input id="name" name="name" placeholder="Ej: Yoga, Pilates, Padel..." required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="day_of_week">Día de la semana</Label>
                            <Select name="day_of_week" defaultValue="1" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Día" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Lunes</SelectItem>
                                    <SelectItem value="2">Martes</SelectItem>
                                    <SelectItem value="3">Miércoles</SelectItem>
                                    <SelectItem value="4">Jueves</SelectItem>
                                    <SelectItem value="5">Viernes</SelectItem>
                                    <SelectItem value="6">Sábado</SelectItem>
                                    <SelectItem value="0">Domingo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Sede o Lugar (Opcional)</Label>
                            <Input id="location" name="location" placeholder="Ej: Club de barrio" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_time">Hora Inicio</Label>
                            <Input id="start_time" name="start_time" type="time" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_time">Hora Fin (Opcional)</Label>
                            <Input id="end_time" name="end_time" type="time" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
