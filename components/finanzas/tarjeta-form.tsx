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
import { CreditCard, Loader2, PlusCircle, Building2 } from 'lucide-react'
import { addCard } from '@/app/(app)/actions/tarjetas'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function TarjetaForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addCard(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Tarjeta agregada correctamente')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Tarjeta
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-primary/30">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Agregar Tarjeta de Crédito</DialogTitle>
                    <DialogDescription>
                        Lleva el control del cupo y la deuda de tus tarjetas.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Tarjeta</Label>
                        <Input id="name" name="name" placeholder="Ej: Visa Platinum, Gold..." required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bank">Entidad Bancaria / Emisor</Label>
                        <Input id="bank" name="bank" placeholder="Ej: Santander, BBVA, Mercado Pago..." required />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground/50">
                            <Building2 className="h-4 w-4 hidden" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="limit_amount">Cupo Total ($)</Label>
                            <Input id="limit_amount" name="limit_amount" type="number" step="0.01" required placeholder="Límite máximo" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="used_amount">Deuda Actual ($)</Label>
                            <Input id="used_amount" name="used_amount" type="number" step="0.01" defaultValue="0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="interest_rate">Interés Mensual (%)</Label>
                            <Input id="interest_rate" name="interest_rate" type="number" step="0.1" placeholder="Ej: 5.5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Día de Cíerre (Opcional)</Label>
                            <Input id="due_date" name="due_date" type="date" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Tarjeta
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
