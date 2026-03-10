'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreVertical, Pencil, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { deleteSubscription, updateSubscription, toggleSubscriptionStatus } from '@/app/(app)/actions/suscripciones'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CURRENCY_LABELS } from '@/lib/utils/formatters'

const CURRENCIES = ['ARS', 'USD', 'USD_BLUE', 'EUR']

interface Props {
    sub: {
        id: string
        name: string
        amount: number
        currency: string
        category: string
        cycle: string
        next_date: string
        is_active: boolean
    }
}

export function SubscriptionActions({ sub }: Props) {
    const [popOpen, setPopOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editCurrency, setEditCurrency] = useState(sub.currency || 'ARS')
    const [editCycle, setEditCycle] = useState(sub.cycle || 'monthly')
    const [editCategory, setEditCategory] = useState(sub.category || 'Entretenimiento')
    const router = useRouter()

    async function handleDelete() {
        if (!confirm(`¿Eliminar "${sub.name}"? Esta acción no tiene vuelta atrás.`)) return
        setDeleting(true)
        const res = await deleteSubscription(sub.id)
        if (res.error) {
            toast.error(res.error)
            setDeleting(false)
        } else {
            toast.success('Suscripción eliminada')
            router.refresh()
        }
    }

    async function handleToggle() {
        const res = await toggleSubscriptionStatus(sub.id, sub.is_active)
        if (res.error) toast.error(res.error)
        else {
            toast.success(sub.is_active ? 'Suscripción pausada' : 'Suscripción reactivada')
            router.refresh()
        }
        setPopOpen(false)
    }

    async function handleEdit(formData: FormData) {
        setSaving(true)
        formData.set('currency', editCurrency)
        formData.set('cycle', editCycle)
        formData.set('category', editCategory)
        const res = await updateSubscription(sub.id, formData)
        setSaving(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Suscripción actualizada')
            setEditOpen(false)
            router.refresh()
        }
    }

    if (deleting) return null

    return (
        <>
            <Popover open={popOpen} onOpenChange={setPopOpen}>
                <PopoverTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[170px] p-1 flex flex-col gap-0.5 glass border-border/50">
                    <button
                        onClick={() => { setEditOpen(true); setPopOpen(false) }}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-muted/60 w-full text-left cursor-pointer"
                    >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                        onClick={handleToggle}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-muted/60 w-full text-left cursor-pointer"
                    >
                        {sub.is_active
                            ? <><ToggleLeft className="h-3.5 w-3.5" /> Pausar</>
                            : <><ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> Reactivar</>
                        }
                    </button>
                    <div className="h-px bg-border/40 my-0.5" />
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-destructive/10 text-destructive w-full text-left cursor-pointer"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
                </PopoverContent>
            </Popover>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[440px] glass border-primary/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-primary" /> Editar Suscripción
                        </DialogTitle>
                    </DialogHeader>
                    <form action={handleEdit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-sub-name">Nombre</Label>
                            <Input id="edit-sub-name" name="name" defaultValue={sub.name} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-sub-amount">Monto</Label>
                                <Input id="edit-sub-amount" name="amount" type="number" step="0.01" defaultValue={sub.amount} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Moneda</Label>
                                <Select value={editCurrency} onValueChange={(v) => v && setEditCurrency(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map(c => <SelectItem key={c} value={c}>{CURRENCY_LABELS[c] || c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Ciclo</Label>
                                <Select value={editCycle} onValueChange={(v) => v && setEditCycle(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Semanal</SelectItem>
                                        <SelectItem value="monthly">Mensual</SelectItem>
                                        <SelectItem value="yearly">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <Select value={editCategory} onValueChange={(v) => v && setEditCategory(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
                                        <SelectItem value="Software">Software y Apps</SelectItem>
                                        <SelectItem value="Gimnasio">Gimnasio</SelectItem>
                                        <SelectItem value="Educacion">Educación</SelectItem>
                                        <SelectItem value="Servicios">Servicios</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-sub-date">Próximo Vencimiento</Label>
                            <Input
                                id="edit-sub-date"
                                name="next_date"
                                type="date"
                                defaultValue={sub.next_date?.split('T')[0] || sub.next_date}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
