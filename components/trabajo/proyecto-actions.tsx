'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { MoreVertical, CheckCircle2, PauseCircle, Trash2, XCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { updateProjectStatus, deleteProject } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ProyectoActions({ project }: { project: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleStatus(status: string) {
        setLoading(true)
        await updateProjectStatus(project.id, status)
        toast.success('Estado actualizado')
        setLoading(false)
        router.refresh()
    }

    async function handleDelete() {
        if (!confirm('¿Eliminar proyecto y todas sus relaciones?')) return
        setLoading(true)
        await deleteProject(project.id)
        toast.success('Proyecto eliminado')
        setLoading(false)
        router.refresh()
    }

    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1 flex flex-col gap-1 glass border-border/50">
                {project.status !== 'active' && (
                    <Button variant="ghost" className="justify-start h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => handleStatus('active')}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar Activo
                    </Button>
                )}
                {project.status !== 'completed' && (
                    <Button variant="ghost" className="justify-start h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" onClick={() => handleStatus('completed')}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Completar
                    </Button>
                )}
                {project.status !== 'paused' && (
                    <Button variant="ghost" className="justify-start h-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" onClick={() => handleStatus('paused')}>
                        <PauseCircle className="h-4 w-4 mr-2" /> Pausar
                    </Button>
                )}
                <Button variant="ghost" className="justify-start h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                </Button>
            </PopoverContent>
        </Popover>
    )
}
