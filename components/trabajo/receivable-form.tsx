'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2, TrendingUp } from 'lucide-react'
import { addReceivable } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ReceivableForm({ projects }: { projects: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currency, setCurrency] = useState('ARS')
    const [projectId, setProjectId] = useState('none')
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData(e.currentTarget)
        fd.set('currency', currency)
        fd.set('project_id', projectId === 'none' ? '' : projectId)
        const res = await addReceivable(fd)
        setLoading(false)
        if (res.error) { toast.error(res.error); return }
        toast.success('Cobro registrado')
        setOpen(false)
        setCurrency('ARS'); setProjectId('none')
        router.refresh()
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Cobro
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px] glass border-emerald-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-400" /> Registrar Cobro</DialogTitle>
                        <DialogDescription>Factura o cobro pendiente de un cliente.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <input type="hidden" name="currency" value={currency} />
                        <input type="hidden" name="project_id" value={projectId === 'none' ? '' : projectId} />
                        <div className="space-y-2">
                            <Label htmlFor="client">Cliente *</Label>
                            <Input id="client" name="client" placeholder="Nombre del cliente" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="concept">Concepto *</Label>
                            <Input id="concept" name="concept" placeholder="Ej: Desarrollo web - Mes 1" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Monto *</Label>
                                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Moneda</Label>
                                <Select value={currency} onValueChange={(v: string | null) => { if (v) setCurrency(v) }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ARS">ARS 🇦🇷</SelectItem>
                                        <SelectItem value="USD">USD 🇺🇸</SelectItem>
                                        <SelectItem value="EUR">EUR 🇪🇺</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Vencimiento</Label>
                                <Input id="due_date" name="due_date" type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice_number">N° Factura</Label>
                                <Input id="invoice_number" name="invoice_number" placeholder="0001-00000001" />
                            </div>
                        </div>
                        {projects.length > 0 && (
                            <div className="space-y-2">
                                <Label>Proyecto</Label>
                                <Select value={projectId} onValueChange={(v: string | null) => { if (v) setProjectId(v) }}>
                                    <SelectTrigger><SelectValue placeholder="Sin proyecto" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin proyecto</SelectItem>
                                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Input id="notes" name="notes" placeholder="Condiciones de pago, etc." />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-emerald-500 text-white hover:bg-emerald-600">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar Cobro
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
