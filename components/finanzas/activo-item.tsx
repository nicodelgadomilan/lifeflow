'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, TrendingUp, TrendingDown, MoreVertical, Edit3, Loader2, BarChart3, FileBarChart, Bitcoin, Home, Package, Car } from 'lucide-react'
import { deleteAsset, updateAssetValue } from '@/app/(app)/actions/activos'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    'Acciones': { icon: BarChart3, color: 'text-blue-500', bg: 'from-blue-600 to-blue-900', label: 'Acciones' },
    'Bonos': { icon: FileBarChart, color: 'text-violet-500', bg: 'from-violet-600 to-purple-900', label: 'Bonos' },
    'FCI': { icon: TrendingUp, color: 'text-emerald-500', bg: 'from-emerald-600 to-teal-900', label: 'FCI / Fondos' },
    'Cripto': { icon: Bitcoin, color: 'text-orange-500', bg: 'from-orange-500 to-amber-700', label: 'Cripto' },
    'Inmueble': { icon: Home, color: 'text-amber-500', bg: 'from-amber-600 to-yellow-800', label: 'Inmueble' },
    'Físico': { icon: Package, color: 'text-yellow-500', bg: 'from-yellow-600 to-amber-800', label: 'Activo Físico' },
    'Vehículo': { icon: Car, color: 'text-sky-500', bg: 'from-sky-600 to-blue-800', label: 'Vehículo' },
    'Otro': { icon: TrendingUp, color: 'text-muted-foreground', bg: 'from-slate-600 to-slate-900', label: 'Otro' },
}

export function ActivoItem({ asset }: { asset: any }) {
    const [deleting, setDeleting] = useState(false)
    const [updateOpen, setUpdateOpen] = useState(false)
    const [updating, setUpdating] = useState(false)

    const cfg = TYPE_CONFIG[asset.type] || TYPE_CONFIG['Otro']
    const Icon = cfg.icon

    const invested = Number(asset.invested_amount) || 0
    const current = Number(asset.current_value) || invested
    const gain = current - invested
    const gainPct = invested > 0 ? (gain / invested) * 100 : 0
    const isPositive = gain >= 0

    const currencySymbol: Record<string, string> = { ARS: '$', USD: 'U$S', EUR: '€', BTC: '₿' }
    const sym = currencySymbol[asset.currency || 'ARS'] || '$'

    function fmt(n: number) {
        return `${sym} ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    async function handleDelete() {
        if (!confirm('¿Eliminar este activo del portafolio?')) return
        setDeleting(true)
        const res = await deleteAsset(asset.id)
        if (res.error) { toast.error(res.error); setDeleting(false) }
    }

    async function handleUpdate(formData: FormData) {
        const val = parseFloat(formData.get('current_value') as string)
        if (isNaN(val) || val < 0) { toast.error('Valor inválido'); return }
        setUpdating(true)
        const toastId = toast.loading('Actualizando valor...')
        const res = await updateAssetValue(asset.id, val)
        setUpdating(false)
        if (res.error) {
            toast.error(res.error, { id: toastId })
        } else {
            toast.success('Cotización actualizada', { id: toastId })
            setUpdateOpen(false)
        }
    }

    if (deleting) return null

    return (
        <Card className="glass border-border/40 overflow-hidden group hover:shadow-lg transition-all">
            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${cfg.bg} p-4 text-white relative overflow-hidden`}>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Icon className="h-20 w-20" strokeWidth={1} />
                </div>
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] font-bold uppercase tracking-widest">
                                {cfg.label}
                            </Badge>
                            {asset.ticker && (
                                <Badge className="bg-black/30 text-white/90 border-0 font-mono text-[10px] font-bold">
                                    {asset.ticker.toUpperCase()}
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-bold mt-1.5 text-sm drop-shadow">{asset.name}</h3>
                        {asset.quantity && (
                            <p className="text-[11px] text-white/70 mt-0.5">{Number(asset.quantity).toLocaleString('es-AR')} unidades</p>
                        )}
                    </div>
                    <Popover>
                        <PopoverTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-white/10 text-white/70 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[165px] p-1 flex flex-col gap-1 glass border-border/50">
                            <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
                                <DialogTrigger className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-muted/60 w-full text-left cursor-pointer">
                                    <Edit3 className="h-3.5 w-3.5" /> Actualizar Valor
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[340px] glass border-primary/30">
                                    <DialogHeader>
                                        <DialogTitle>Actualizar Cotización</DialogTitle>
                                    </DialogHeader>
                                    <form action={handleUpdate} className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <Label>Valor Actual ({asset.currency || 'ARS'})</Label>
                                            <Input autoFocus name="current_value" type="number" step="0.01" defaultValue={current} required className="h-12 text-lg font-bold" />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="ghost" onClick={() => setUpdateOpen(false)}>Cancelar</Button>
                                            <Button type="submit" disabled={updating}>
                                                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Actualizar
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <Button variant="ghost" className="justify-start h-8 text-destructive hover:bg-destructive/10 hover:text-destructive text-sm" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Stats */}
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Valor Actual</p>
                        <p className="text-xl font-black leading-none">{fmt(current)}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-sm ${isPositive ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {isPositive ? '+' : ''}{gainPct.toFixed(2)}%
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-3">
                    <div className="bg-muted/30 rounded-lg p-2 border border-border/30">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Invertido</p>
                        <p className="font-bold text-sm">{fmt(invested)}</p>
                    </div>
                    <div className={`rounded-lg p-2 border ${isPositive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Ganancia/Pérdida</p>
                        <p className={`font-bold text-sm ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isPositive ? '+' : ''}{fmt(gain)}
                        </p>
                    </div>
                </div>

                {asset.purchase_date && (
                    <p className="text-[11px] text-muted-foreground">
                        Comprado: {new Date(asset.purchase_date).toLocaleDateString('es-AR')}
                        {asset.notes && <> · {asset.notes}</>}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
