'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, CreditCard, Landmark, Banknote, Percent, MoreVertical, LayoutList } from 'lucide-react'
import { deleteCard, payCard } from '@/app/(app)/actions/tarjetas'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface TarjetaProps {
    card: any
}

export function TarjetaItem({ card }: TarjetaProps) {
    const [deleting, setDeleting] = useState(false)
    const [paying, setPaying] = useState(false)
    const [payOpen, setPayOpen] = useState(false)

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar esta tarjeta? (No afectará las transacciones pasadas)')) return
        setDeleting(true)
        const toastId = toast.loading('Eliminando...')
        const res = await deleteCard(card.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Tarjeta eliminada correctamente', { id: toastId })
    }

    async function handlePay(formData: FormData) {
        const payStr = formData.get('payAmount') as string
        const payNum = parseFloat(payStr)

        if (!payNum || payNum <= 0) {
            toast.error('Especifica un monto válido a pagar.')
            return
        }

        if (payNum > Number(card.used_amount)) {
            toast.error('No puedes pagar más del saldo deudor acumulado.')
            return
        }

        setPaying(true)
        const toastId = toast.loading('Registrando pago y actualizando cupo...')

        const res = await payCard(card.id, payNum)
        setPaying(false)

        if (res.error) {
            toast.error(res.error, { id: toastId })
        } else {
            toast.success('Pago de tarjeta registrado en finanzas', { id: toastId })
            setPayOpen(false)
        }
    }

    if (deleting) return null

    // Progress bar math
    const used = Number(card.used_amount) || 0
    const limit = Number(card.limit_amount) || 1
    const available = limit - used

    // Safety clamp 0-100%
    const usagePercentage = Math.min(100, Math.max(0, (used / limit) * 100))

    // Status colors
    let usageColor = 'bg-emerald-500' // good
    if (usagePercentage > 50) usageColor = 'bg-amber-500' // warning
    if (usagePercentage > 85) usageColor = 'bg-rose-500'  // danger

    // Fallback theme colors by checking name
    const nameLower = card.name.toLowerCase()
    let cardGradient = 'from-slate-700 to-slate-900' // Base Dark
    if (nameLower.includes('gold') || nameLower.includes('oro')) cardGradient = 'from-amber-400 to-yellow-600 shadow-amber-500/10'
    else if (nameLower.includes('plat') || nameLower.includes('black')) cardGradient = 'from-stone-800 to-stone-950 shadow-black'
    else if (nameLower.includes('visa') && !nameLower.includes('master')) cardGradient = 'from-blue-600 to-blue-900 shadow-blue-500/10'
    else if (nameLower.includes('master')) cardGradient = 'from-orange-500 to-red-600 shadow-red-500/10'
    else if (nameLower.includes('mercado') || nameLower.includes('mp')) cardGradient = 'from-sky-400 to-blue-600 shadow-sky-500/10'

    return (
        <Card className={`glass transition-all overflow-hidden border-border/40 relative group`}>
            {/* Visual Header / Physical Card Mockup */}
            <div className={`p-5 text-white bg-gradient-to-br ${cardGradient} relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
                <Landmark className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10 rotate-12" strokeWidth={1} />

                <div className="flex justify-between items-start z-10">
                    <div>
                        <p className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-0.5">{card.bank}</p>
                        <h3 className="font-bold relative flex items-center gap-2 drop-shadow-md">
                            <CreditCard className="h-4 w-4" /> {card.name}
                        </h3>
                    </div>
                    <Popover>
                        <PopoverTrigger className="inline-flex items-center justify-center rounded-md hover:bg-white/10 text-white/70 h-8 w-8 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[160px] p-1 gap-1 flex flex-col glass border-border/50">
                            <Button variant="ghost" className="justify-start h-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Tarjeta
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="z-10 mt-6 flex flex-col gap-1 drop-shadow-sm">
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Cupo Total Maximo</p>
                    <p className="text-2xl font-black">{formatCurrency(limit)}</p>
                </div>
            </div>

            {/* Content stats */}
            <CardContent className="p-5 flex flex-col gap-4">

                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Uso actual: <span className="text-muted-foreground">{usagePercentage.toFixed(1)}%</span></span>
                        <span className={usageColor.replace('bg-', 'text-')}>{formatCurrency(used)}</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden border border-border/50">
                        <div className={`h-2 transition-all ${usageColor}`} style={{ width: `${usagePercentage}%` }}></div>
                    </div>
                    <p className="text-[11px] text-muted-foreground text-right w-full">Disponible: {formatCurrency(available)}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 border-t border-border/50 pt-4">
                    <div className="flex flex-col bg-muted/30 p-2 py-3 rounded-lg border border-border/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase mb-1"><Percent className="h-3 w-3" /> Interés Mensual</div>
                        <p className="font-bold text-sm">{card.interest_rate}% <span className="text-xs font-normal opacity-50">TNA</span></p>
                    </div>
                    <div className="flex flex-col bg-muted/30 p-2 py-3 rounded-lg border border-border/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase mb-1"><LayoutList className="h-3 w-3" /> Día sugerido</div>
                        <p className="font-bold text-sm">{card.due_date ? formatDate(new Date(card.due_date)) : 'N/A'}</p>
                    </div>
                </div>

                <div className="mt-2 text-right">
                    <Dialog open={payOpen} onOpenChange={setPayOpen}>
                        <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-transparent h-9 px-4 py-2 w-full gap-2 cursor-pointer">
                            <Banknote className="h-4 w-4" /> Abonar Pago de Tarjeta
                        </DialogTrigger>
                        <DialogContent className="glass border-primary/30 sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" /> Configurar Plan de Pago
                                </DialogTitle>
                                <DialogDescription>
                                    Ingresá el importe abonado. Se restará del acumulado de la tarjeta y se agregará a tus gastos de este mes.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 mt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Deuda total restante:</span>
                                    <span className="font-bold">{formatCurrency(used)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Interés punitorio/fijo aprox:</span>
                                    <span className="font-semibold text-destructive">+ {formatCurrency(used * (Number(card.interest_rate) / 100))}</span>
                                </div>
                            </div>

                            <form action={handlePay} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground uppercase text-xs font-black tracking-widest">Ingrese el pago realizado ($)</Label>
                                    <Input autoFocus name="payAmount" type="number" step="0.01" defaultValue={used} required className="text-xl font-bold h-12" />
                                    <p className="text-[10px] text-muted-foreground leading-tight">Al dar "Confirmar" este crédito se liberará en el saldo disponible del mes próximo.</p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" type="button" onClick={() => setPayOpen(false)}>Cancelar</Button>
                                    <Button disabled={paying} type="submit" className="bg-primary text-primary-foreground font-bold hover:brightness-110">
                                        Confirmar Pago {paying && '...'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}
