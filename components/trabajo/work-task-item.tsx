'use client'
import { useState } from 'react'
import { updateWorkTaskStatus, deleteWorkTask } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight, Clock } from 'lucide-react'

const PRIORITY_COLORS: Record<string, string> = {
    low: 'border-l-muted', medium: 'border-l-blue-500', high: 'border-l-orange-500', urgent: 'border-l-red-500'
}
const NEXT_STATUS: Record<string, string> = {
    todo: 'in_progress', in_progress: 'review', review: 'done', done: 'todo'
}
const NEXT_LABEL: Record<string, string> = {
    todo: 'Iniciar', in_progress: 'Revisar', review: 'Completar', done: 'Reabrir'
}

export function WorkTaskItem({ task }: { task: any }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function advance() {
        setLoading(true)
        await updateWorkTaskStatus(task.id, NEXT_STATUS[task.status])
        router.refresh()
        setLoading(false)
    }

    async function del() {
        if (!confirm('¿Eliminar tarea?')) return
        await deleteWorkTask(task.id)
        router.refresh()
    }

    const isDone = task.status === 'done'
    const daysLeft = task.due_date ? Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000) : null
    const isOverdue = daysLeft !== null && daysLeft < 0

    return (
        <div className={`glass rounded-lg p-3 border border-border/30 border-l-2 ${PRIORITY_COLORS[task.priority] || 'border-l-muted'} ${isDone ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                    </p>
                    {task.work_projects && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">📁 {task.work_projects.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        {daysLeft !== null && (
                            <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? 'text-rose-400 font-bold' : 'text-muted-foreground'}`}>
                                <Clock className="h-3 w-3" />
                                {isOverdue ? `Vencido ${Math.abs(daysLeft)}d` : `${daysLeft}d`}
                            </span>
                        )}
                        {task.estimated_hours && (
                            <span className="text-[10px] text-muted-foreground">{task.estimated_hours}h</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    <button onClick={advance} disabled={loading}
                        className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                        {NEXT_LABEL[task.status]} <ArrowRight className="h-3 w-3" />
                    </button>
                    <button onClick={del} className="p-1 h-6 w-6 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}
