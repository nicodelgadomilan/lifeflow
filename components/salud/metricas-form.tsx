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
import { addHealthMetric } from '@/app/(app)/actions/salud'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function MetricasForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addHealthMetric(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Métrica cargada al perfil')
            setOpen(false)
            router.refresh()
        }
    }

    const todayStr = new Date().toISOString().slice(0, 10)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Registro
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-sky-500/30">
                <DialogHeader>
                    <DialogTitle>Trackear Métrica Corporal</DialogTitle>
                    <DialogDescription>
                        Carga tu peso, presión o hidratación del día.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Día del Registro</Label>
                        <Input id="date" name="date" type="date" defaultValue={todayStr} required />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="type">Tipo de Medida</Label>
                            <Select name="type" defaultValue="Peso">
                                <SelectTrigger>
                                    <SelectValue placeholder="Métrica" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Peso">Peso Corporal</SelectItem>
                                    <SelectItem value="Presion">Presión Arterial</SelectItem>
                                    <SelectItem value="Agua">Hidratación</SelectItem>
                                    <SelectItem value="Sueno">Horas de Sueño</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="value">Valor</Label>
                            <Input id="value" name="value" type="number" step="0.1" placeholder="Ej: 75.5" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit">Unidad (Kg, L, mmHg...)</Label>
                        <Input id="unit" name="unit" placeholder="Ej: Kg" required />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-sky-500 text-white hover:bg-sky-600">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
