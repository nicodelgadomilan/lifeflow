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
import { addAppointment } from '@/app/(app)/actions/salud'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CitasForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addAppointment(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Cita médica guardada')
            setOpen(false)
            router.refresh()
        }
    }

    const todayStr = new Date().toISOString().slice(0, 16)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agendar Turno
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-rose-500/30">
                <DialogHeader>
                    <DialogTitle>Nueva Cita Médica</DialogTitle>
                    <DialogDescription>
                        Registra tu próximo turno con el médico, dentista, o análisis.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="doctor">Médico o Especialista</Label>
                        <Input id="doctor" name="doctor" placeholder="Ej: Dra. Pérez" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Especialidad</Label>
                        <Select name="type" defaultValue="Clinico">
                            <SelectTrigger>
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Clinico">Médico Clínico</SelectItem>
                                <SelectItem value="Dentista">Odontólogo</SelectItem>
                                <SelectItem value="Oftalmologo">Oftalmólogo</SelectItem>
                                <SelectItem value="Laboratorio">Análisis Clínicos</SelectItem>
                                <SelectItem value="Terapia">Psicólogo / Terapia</SelectItem>
                                <SelectItem value="Kinesiologo">Kinesiólogo</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha y Hora</Label>
                        <Input id="date" name="date" type="datetime-local" defaultValue={todayStr} required />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-rose-500 text-white hover:bg-rose-600">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Agendar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
