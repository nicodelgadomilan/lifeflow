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
import { addMaintenance } from '@/app/(app)/actions/vehiculo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function MantenimientoForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addMaintenance(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Servicio registrado exitosamente')
            setOpen(false)
            router.refresh()
        }
    }

    const todayStr = new Date().toISOString().slice(0, 10)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Service
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-blue-500/30">
                <DialogHeader>
                    <DialogTitle>Registrar Mantenimiento</DialogTitle>
                    <DialogDescription>
                        Carga el cambio de aceite, lavado o afinación.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input id="date" name="date" type="date" defaultValue={todayStr} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select name="type" defaultValue="Aceite">
                                <SelectTrigger>
                                    <SelectValue placeholder="Servicio" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Aceite">Aceite y Filtros</SelectItem>
                                    <SelectItem value="Cubiertas">Cubiertas / Alineación</SelectItem>
                                    <SelectItem value="Frenos">Frenos</SelectItem>
                                    <SelectItem value="Bateria">Batería</SelectItem>
                                    <SelectItem value="Lavado">Lavado</SelectItem>
                                    <SelectItem value="General">Service General</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mileage_km">Kilometraje Actual</Label>
                            <Input id="mileage_km" name="mileage_km" type="number" placeholder="Ej: 45000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cost">Costo Total ($)</Label>
                            <Input id="cost" name="cost" type="number" step="0.01" placeholder="Ej: 50000" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="next_date">Próximo Vencimiento Sugerido</Label>
                        <Input id="next_date" name="next_date" type="date" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas o Marca de aceite</Label>
                        <Input id="notes" name="notes" placeholder="Ej: Semi 10w40 Castrol..." />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-500 text-white hover:bg-blue-600">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
