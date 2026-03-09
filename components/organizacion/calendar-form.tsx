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
import { addCalendarEvent } from '@/app/(app)/actions/organizacion-calendario'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CalendarEventForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addCalendarEvent(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Evento programado')
            setOpen(false)
            router.refresh()
        }
    }

    // Get today's default value for datetime-local
    const todayStr = new Date().toISOString().slice(0, 16)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary/10 text-primary hover:bg-primary/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Evento
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-primary/30">
                <DialogHeader>
                    <DialogTitle>Programar Evento</DialogTitle>
                    <DialogDescription>
                        Añade una cita, reunión o cumpleaños al calendario.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Evento</Label>
                        <Input id="title" name="title" placeholder="Ej: Turno Médico" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Evento</Label>
                        <Select name="type" defaultValue="event">
                            <SelectTrigger>
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="event">Evento General</SelectItem>
                                <SelectItem value="meeting">Reunión</SelectItem>
                                <SelectItem value="birthday">Cumpleaños</SelectItem>
                                <SelectItem value="reminder">Recordatorio</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="start_date">Fecha y Hora</Label>
                        <Input id="start_date" name="start_date" type="datetime-local" defaultValue={todayStr} required />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input type="checkbox" id="all_day" name="all_day" className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20" />
                        <Label htmlFor="all_day">Todo el día</Label>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Evento
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
