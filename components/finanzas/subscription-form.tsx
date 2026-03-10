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
import { addSubscription } from '@/app/(app)/actions/suscripciones'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const CURRENCIES = [
    { value: 'ARS', label: '🇦🇷 ARS – Peso argentino' },
    { value: 'USD', label: '🇺🇸 USD – Dólar oficial' },
    { value: 'USD_BLUE', label: '💵 USD Blue' },
    { value: 'EUR', label: '🇪🇺 EUR – Euro' },
]

export function SubscriptionFormDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addSubscription(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Suscripción agregada con éxito')
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
                        Nueva Suscripción
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] glass">
                <DialogHeader>
                    <DialogTitle>Añadir nueva Suscripción</DialogTitle>
                    <DialogDescription>
                        Registra Netflix, Gym, o cualquier servicio recurrente. Podés elegir la moneda.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre / Servicio</Label>
                        <Input id="name" name="name" placeholder="Ej: Netflix Premium" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Moneda</Label>
                            <Select name="currency" defaultValue="ARS" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map(c => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cycle">Ciclo de cobro</Label>
                        <Select name="cycle" defaultValue="monthly" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Ciclo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensual</SelectItem>
                                <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select name="category" defaultValue="Entretenimiento" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
                                <SelectItem value="Software">Software y Apps</SelectItem>
                                <SelectItem value="Gimnasio">Gimnasio / Deportes</SelectItem>
                                <SelectItem value="Educacion">Educación</SelectItem>
                                <SelectItem value="Servicios">Servicios Generales</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="next_date">Próximo Vencimiento</Label>
                        <Input id="next_date" name="next_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
