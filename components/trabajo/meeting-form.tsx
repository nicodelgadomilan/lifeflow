'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Loader2, Users } from 'lucide-react'
import { addMeeting } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function MeetingForm({ projects }: { projects: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState('virtual')
    const [projectId, setProjectId] = useState('none')
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData(e.currentTarget)
        fd.set('type', type)
        fd.set('project_id', projectId === 'none' ? '' : projectId)
        const res = await addMeeting(fd)
        setLoading(false)
        if (res.error) { toast.error(res.error); return }
        toast.success('Reunión agendada')
        setOpen(false)
        setType('virtual'); setProjectId('none')
        router.refresh()
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Reunión
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px] glass border-violet-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-violet-400" /> Agendar Reunión</DialogTitle>
                        <DialogDescription>Registrá la reunión con su fecha, hora y participantes.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="project_id" value={projectId === 'none' ? '' : projectId} />
                        <div className="space-y-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input id="title" name="title" placeholder="Ej: Kickoff proyecto, Revisión entrega..." required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="meeting_date">Fecha *</Label>
                                <Input id="meeting_date" name="meeting_date" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meeting_time">Hora</Label>
                                <Input id="meeting_time" name="meeting_time" type="time" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select value={type} onValueChange={(v: string | null) => { if (v) setType(v) }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="virtual">Virtual 💻</SelectItem>
                                        <SelectItem value="presencial">Presencial 🏢</SelectItem>
                                        <SelectItem value="telefonica">Telefónica 📞</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration_min">Duración (min)</Label>
                                <Input id="duration_min" name="duration_min" type="number" defaultValue="60" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="with_whom">Participantes</Label>
                            <Input id="with_whom" name="with_whom" placeholder="Cliente, equipo, proveedor..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación / Link</Label>
                            <Input id="location" name="location" placeholder="Meet, Zoom, dirección..." />
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
                            <Label htmlFor="agenda">Agenda / Notas</Label>
                            <Textarea id="agenda" name="agenda" placeholder="Temas a tratar..." rows={2} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-violet-500 text-white hover:bg-violet-600">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Agendar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
