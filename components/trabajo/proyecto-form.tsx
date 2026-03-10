'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Loader2, FolderKanban } from 'lucide-react'
import { addProject } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function ProyectoForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('active')
    const [priority, setPriority] = useState('medium')
    const [color, setColor] = useState('#6366f1')
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData(e.currentTarget)
        fd.set('status', status)
        fd.set('priority', priority)
        fd.set('color', color)
        const res = await addProject(fd)
        setLoading(false)
        if (res.error) { toast.error(res.error); return }
        toast.success('Proyecto creado')
        setOpen(false)
        setStatus('active'); setPriority('medium'); setColor('#6366f1')
        router.refresh()
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Proyecto
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[480px] glass border-indigo-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-indigo-400" /> Nuevo Proyecto</DialogTitle>
                        <DialogDescription>Crea un proyecto y asignale tareas, reuniones y cobros.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <input type="hidden" name="status" value={status} />
                        <input type="hidden" name="priority" value={priority} />
                        <input type="hidden" name="color" value={color} />
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Proyecto *</Label>
                            <Input id="name" name="name" placeholder="Ej: App LifeHub, Rediseño web..." required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="client">Cliente</Label>
                                <Input id="client" name="client" placeholder="Nombre del cliente" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budget">Presupuesto ($)</Label>
                                <Input id="budget" name="budget" type="number" step="0.01" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select value={status} onValueChange={(v: string | null) => { if (v) setStatus(v) }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="paused">Pausado</SelectItem>
                                        <SelectItem value="completed">Completado</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Prioridad</Label>
                                <Select value={priority} onValueChange={(v: string | null) => { if (v) setPriority(v) }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baja</SelectItem>
                                        <SelectItem value="medium">Media</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Fecha Límite</Label>
                            <Input id="deadline" name="deadline" type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label>Color del Proyecto</Label>
                            <div className="flex gap-2 flex-wrap">
                                {COLORS.map(c => (
                                    <button key={c} type="button" onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea id="notes" name="notes" placeholder="Descripción, objetivos, etc." rows={2} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-indigo-500 text-white hover:bg-indigo-600">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar Proyecto
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
