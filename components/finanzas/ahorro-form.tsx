'use client'

import { useState } from 'react'
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PiggyBank, Loader2, PlusCircle, Banknote, Building2, Wallet } from 'lucide-react'
import { addSavingsGoal } from '@/app/(app)/actions/ahorros'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CURRENCY_LABELS } from '@/lib/utils/formatters'

const CURRENCIES = ['ARS', 'USD', 'USD_BLUE', 'EUR']

export function AhorroForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [locationType, setLocationType] = useState('Efectivo')
    const [currency, setCurrency] = useState('ARS')
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        formData.set('location', locationType)
        formData.set('currency', currency)
        const res = await addSavingsGoal(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Objetivo de ahorro creado')
            setOpen(false)
            router.refresh()
        }
    }

    const showBankField = locationType !== 'Efectivo'

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
                <PlusCircle className="h-4 w-4" />
                Nuevo Objetivo
            </DialogTrigger>
            <DialogContent className="sm:max-w-[470px] glass border-primary/30">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-emerald-500" /> Crear Objetivo de Ahorro
                    </DialogTitle>
                    <DialogDescription>
                        Define dónde guardas tu dinero: efectivo, banco, billetera virtual o inversión.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">¿Para qué estás ahorrando?</Label>
                        <Input id="name" name="name" placeholder="Ej: Vacaciones, Fondo de emergencia, Auto..." required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="goal_amount">Meta de Ahorro</Label>
                            <Input id="goal_amount" name="goal_amount" type="number" step="0.01" placeholder="Total a alcanzar" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current_amount">Tengo Ahorrado</Label>
                            <Input id="current_amount" name="current_amount" type="number" step="0.01" defaultValue="0" placeholder="0" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Moneda del ahorro</Label>
                        <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CURRENCIES.map(c => (
                                    <SelectItem key={c} value={c}>{CURRENCY_LABELS[c] || c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Selector */}
                    <div className="space-y-2">
                        <Label>¿Dónde está guardado?</Label>
                        <Select onValueChange={(v) => v && setLocationType(v)} defaultValue="Efectivo">
                            <SelectTrigger>
                                <SelectValue placeholder="Tipo de resguardo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Efectivo">
                                    <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-emerald-500" /> Efectivo / Cash</span>
                                </SelectItem>
                                <SelectItem value="Cuenta Bancaria">
                                    <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-500" /> Cuenta Bancaria</span>
                                </SelectItem>
                                <SelectItem value="Caja de Ahorro">
                                    <span className="flex items-center gap-2"><PiggyBank className="h-4 w-4 text-violet-500" /> Caja de Ahorro</span>
                                </SelectItem>
                                <SelectItem value="Billetera Virtual">
                                    <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-sky-500" /> Billetera Virtual</span>
                                </SelectItem>
                                <SelectItem value="Plazo Fijo">
                                    <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-amber-500" /> Plazo Fijo</span>
                                </SelectItem>
                                <SelectItem value="Inversión">
                                    <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-orange-500" /> Inversión / FCI</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {showBankField && (
                        <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/50">
                            <Label htmlFor="location_detail">Entidad / Institución</Label>
                            <Input id="location_detail" name="location_detail" placeholder="Ej: Santander, Naranja X, Brubank, BBVA..." />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="target_date">Fecha Meta (Opcional)</Label>
                            <Input id="target_date" name="target_date" type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Nota (Opcional)</Label>
                            <Input id="notes" name="notes" placeholder="Descripción corta..." />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Objetivo
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
