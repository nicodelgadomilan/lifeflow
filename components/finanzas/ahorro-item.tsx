'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Trash2, PiggyBank, Banknote, Building2, Wallet, Plus, Minus, CalendarClock, Target, ChevronRight, MoreVertical } from 'lucide-react'
import { deleteSavingsGoal, addSavingsMovement } from '@/app/(app)/actions/ahorros'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface AhorroItemProps {
    goal: any
}

export function AhorroItem({ goal }: AhorroItemProps) {
    const [deleting, setDeleting] = useState(false)
    const [movOpen, setMovOpen] = useState(false)
    const [movType, setMovType] = useState<'deposit' | 'withdrawal'>('deposit')
    const [loading, setLoading] = useState(false)

    const current = Number(goal.current_amount) || 0
    const target = Number(goal.goal_amount) || 1
    const progress = Math.min(100, Math.max(0, (current / target) * 100))
    const remaining = Math.max(0, target - current)
    const achieved = current >= target

    // Parse the location string
    const locationRaw: string = goal.location || 'Efectivo'
    const [locType, locDetail] = locationRaw.includes('—')
        ? locationRaw.split('—').map((s: string) => s.trim())
        : [locationRaw, null]

    // Icon & color by location type
    const locConfig: Record<string, { icon: any; color: string; badge: string }> = {
        'Efectivo': { icon: Banknote, color: 'text-emerald-500 bg-emerald-500/10', badge: 'border-emerald-500/40 text-emerald-500' },
        'Cuenta Bancaria': { icon: Building2, color: 'text-blue-500 bg-blue-500/10', badge: 'border-blue-500/40 text-blue-500' },
        'Caja de Ahorro': { icon: PiggyBank, color: 'text-violet-500 bg-violet-500/10', badge: 'border-violet-500/40 text-violet-500' },
        'Billetera Virtual': { icon: Wallet, color: 'text-sky-500 bg-sky-500/10', badge: 'border-sky-500/40 text-sky-500' },
        'Plazo Fijo': { icon: Building2, color: 'text-amber-500 bg-amber-500/10', badge: 'border-amber-500/40 text-amber-500' },
        'Inversión': { icon: Building2, color: 'text-orange-500 bg-orange-500/10', badge: 'border-orange-500/40 text-orange-500' },
    }
    const locCfg = locConfig[locType] || locConfig['Efectivo']
    const LocIcon = locCfg.icon

    // Progress bar color
    let barColor = 'bg-emerald-500'
    if (progress < 33) barColor = 'bg-rose-500'
    else if (progress < 66) barColor = 'bg-amber-500'

    async function handleDelete() {
        if (!confirm('¿Eliminar este objetivo de ahorro?')) return
        setDeleting(true)
        const res = await deleteSavingsGoal(goal.id)
        if (res.error) {
            toast.error(res.error)
            setDeleting(false)
        }
    }

    async function handleMovement(formData: FormData) {
        const amountStr = formData.get('amount') as string
        const notes = formData.get('notes') as string
        const amount = parseFloat(amountStr)

        if (!amount || amount <= 0) {
            toast.error('Ingresa un monto válido')
            return
        }

        setLoading(true)
        const toastId = toast.loading(movType === 'deposit' ? 'Depositando...' : 'Retirando...')
        const res = await addSavingsMovement(goal.id, amount, movType, notes)
        setLoading(false)

        if (res.error) {
            toast.error(res.error, { id: toastId })
        } else {
            toast.success(movType === 'deposit' ? '¡Depósito registrado!' : 'Retiro registrado.', { id: toastId })
            setMovOpen(false)
        }
    }

    if (deleting) return null

    return (
        <Card className={`glass border-border/40 hover:shadow-lg transition-shadow overflow-hidden ${achieved ? 'ring-1 ring-emerald-500/40 shadow-emerald-500/10' : ''}`}>
            {/* Header strip */}
            <CardHeader className={`p-4 pb-3 flex flex-row items-start justify-between gap-3 bg-gradient-to-r from-background/80 to-muted/30 border-b border-border/30`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${locCfg.color}`}>
                        <LocIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm truncate">{goal.name}</h3>
                            {achieved && (
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/40 text-[10px] px-1.5 font-bold shrink-0">
                                    ✓ ¡Logrado!
                                </Badge>
                            )}
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-1.5 font-semibold mt-1 ${locCfg.badge}`}>
                            {locType}{locDetail && ` · ${locDetail}`}
                        </Badge>
                    </div>
                </div>
                <Popover>
                    <PopoverTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted/80 text-muted-foreground transition-colors shrink-0">
                        <MoreVertical className="h-4 w-4" />
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[160px] p-1 flex flex-col gap-1 glass border-border/50">
                        <Button variant="ghost" className="justify-start h-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </Button>
                    </PopoverContent>
                </Popover>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
                {/* Amounts */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest mb-0.5">Ahorrado</p>
                        <p className="text-2xl font-black leading-none">{formatCurrency(current)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest mb-0.5 flex items-center gap-1 justify-end"><Target className="h-3 w-3" /> Meta</p>
                        <p className="text-sm font-bold text-muted-foreground">{formatCurrency(target)}</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                    <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden border border-border/40">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-700 ${barColor} ${achieved ? 'animate-pulse' : ''}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold">{progress.toFixed(1)}% completado</span>
                        {!achieved && <span>Faltan {formatCurrency(remaining)}</span>}
                    </div>
                </div>

                {/* Meta date if set */}
                {goal.target_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        <span>Meta para: <span className="font-semibold text-foreground">{formatDate(new Date(goal.target_date))}</span></span>
                    </div>
                )}

                {/* Notes */}
                {goal.notes && (
                    <p className="text-xs text-muted-foreground italic flex items-start gap-1">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {goal.notes}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-border/30">
                    <Dialog open={movOpen && movType === 'deposit'} onOpenChange={(o) => { setMovOpen(o); setMovType('deposit') }}>
                        <DialogTrigger className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-colors h-9 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border-0 cursor-pointer">
                            <Plus className="h-4 w-4" /> Depositar
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[360px] glass border-emerald-500/30">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-emerald-500"><Plus className="h-4 w-4" /> Agregar Depósito</DialogTitle>
                            </DialogHeader>
                            <form action={handleMovement} className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Monto a depositar ($)</Label>
                                    <Input autoFocus name="amount" type="number" step="0.01" required className="h-12 text-lg font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nota (opcional)</Label>
                                    <Input name="notes" placeholder="Ej: Sueldo de marzo..." />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setMovOpen(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                                        Confirmar Depósito
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={movOpen && movType === 'withdrawal'} onOpenChange={(o) => { setMovOpen(o); setMovType('withdrawal') }}>
                        <DialogTrigger className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-colors h-9 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-0 cursor-pointer">
                            <Minus className="h-4 w-4" /> Retirar
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[360px] glass border-rose-500/30">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-rose-500"><Minus className="h-4 w-4" /> Registrar Retiro</DialogTitle>
                            </DialogHeader>
                            <form action={handleMovement} className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Monto a retirar ($)</Label>
                                    <Input autoFocus name="amount" type="number" step="0.01" required className="h-12 text-lg font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nota (opcional)</Label>
                                    <Input name="notes" placeholder="Ej: Gastos de urgencia..." />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setMovOpen(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={loading} className="bg-rose-500 hover:bg-rose-600 text-white font-bold">
                                        Confirmar Retiro
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
