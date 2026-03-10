'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Loader2, CheckSquare } from 'lucide-react'
import { addWorkTask } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function WorkTaskForm({ projects }: { projects: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [priority, setPriority] = useState('medium')
    const [projectId, setProjectId] = useState('none')
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData(e.currentTarget)
        fd.set('priority', priority)
        fd.set('project_id', projectId === 'none' ? '' : projectId)
        const res = await addWorkTask(fd)
        setLoading(false)
        if (res.error) { toast.error(res.error); return }
        toast.success('Tarea creada')
        setOpen(false)
        setPriority('medium'); setProjectId('none')
        router.refresh()
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Tarea
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px] glass border-blue-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-blue-400" /> Nueva Tarea</DialogTitle>
                        <DialogDescription>Tarea de trabajo, opcionalmente vinculada a un proyecto.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <input type="hidden" name="priority" value={priority} />
                        <input type="hidden" name="project_id" value={projectId === 'none' ? '' : projectId} />
                        <div className="space-y-2">
                            <Label htmlFor="title">Tarea *</Label>
                            <Input id="title" name="title" placeholder="¿Qué hay que hacer?" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
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
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Fecha Límite</Label>
                                <Input id="due_date" name="due_date" type="date" />
                            </div>
                        </div>
                        {projects.length > 0 && (
                            <div className="space-y-2">
                                <Label>Proyecto (opcional)</Label>
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
                            <Label htmlFor="estimated_hours">Horas estimadas</Label>
                            <Input id="estimated_hours" name="estimated_hours" type="number" step="0.5" placeholder="1.5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea id="description" name="description" placeholder="Detalles de la tarea..." rows={2} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-blue-500 text-white hover:bg-blue-600">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar Tarea
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
