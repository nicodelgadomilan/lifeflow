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
import { logGymSession } from '@/app/(app)/actions/deportes'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function GymLogForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await logGymSession(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Entrenamiento registrado con éxito')
            setOpen(false)
            router.refresh()
        }
    }

    const todayStr = new Date().toISOString().slice(0, 10)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Asistencia
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-emerald-500/30">
                <DialogHeader>
                    <DialogTitle>Guardar Entrenamiento</DialogTitle>
                    <DialogDescription>
                        Firma tu asistencia al gimnasio de hoy. Escribe notas sobre tu progreso de peso y repeticiones.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Día</Label>
                            <Input id="date" name="date" type="date" defaultValue={todayStr} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration_min">Duración (minutos)</Label>
                            <Input id="duration_min" name="duration_min" type="number" placeholder="Ej: 60" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Rutina y Notas (Pesos, Ejercicios...)</Label>
                        <textarea
                            id="notes"
                            name="notes"
                            placeholder="Ej: Pecho y Triceps. Press Banca 60kg, 4x10..."
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-500 text-black hover:bg-emerald-600">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
