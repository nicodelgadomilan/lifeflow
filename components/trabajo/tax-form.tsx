'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2, Receipt } from 'lucide-react'
import { addTax } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function TaxForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState('periodic')
    const [category, setCategory] = useState('national')
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData(e.currentTarget)
        fd.set('type', type)
        fd.set('category', category)
        const res = await addTax(fd)
        setLoading(false)
        if (res.error) { toast.error(res.error); return }
        toast.success('Impuesto registrado')
        setOpen(false)
        setType('periodic'); setCategory('national')
        router.refresh()
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Impuesto
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px] glass border-amber-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-amber-400" /> Registrar Impuesto</DialogTitle>
                        <DialogDescription>Agregá un vencimiento tributario o declaración pendiente.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="category" value={category} />
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Impuesto *</Label>
                            <Input id="name" name="name" placeholder="Ej: Monotributo, IVA, Ganancias, IIBB..." required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select value={type} onValueChange={(v: string | null) => { if (v) setType(v) }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="periodic">Periódico (mensual)</SelectItem>
                                        <SelectItem value="annual">Anual</SelectItem>
                                        <SelectItem value="one_time">Único</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Jurisdicción</Label>
                                <Select value={category} onValueChange={(v: string | null) => { if (v) setCategory(v) }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="national">🇦🇷 Nacional</SelectItem>
                                        <SelectItem value="provincial">🏛️ Provincial</SelectItem>
                                        <SelectItem value="municipal">🏙️ Municipal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Monto ($)</Label>
                                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Vencimiento *</Label>
                                <Input id="due_date" name="due_date" type="date" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period">Período</Label>
                            <Input id="period" name="period" placeholder="Ej: Marzo 2026, 1er Trimestre 2026..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Input id="notes" name="notes" placeholder="Categoría monotributo, CUIT, etc." />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-amber-500 text-black hover:bg-amber-600">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
