'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trash2, Loader2, ArrowRight } from 'lucide-react'
import { toggleTaskStatus, deleteTask } from '@/app/(app)/actions/organizacion'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/formatters'
import { Button } from '@/components/ui/button'

interface TaskItemProps {
    task: any
}

export function TaskItem({ task }: TaskItemProps) {
    const [submitting, setSubmitting] = useState(false)
    const [localChecked, setLocalChecked] = useState(task.status === 'done')
    const [deleting, setDeleting] = useState(false)

    async function handleToggleStatus() {
        setSubmitting(true)
        setLocalChecked(!localChecked)
        const toastId = toast.loading('Actualizando estado...')
        const res = await toggleTaskStatus(task.id, task.status)
        setSubmitting(false)
        if (res.error) {
            toast.error(res.error, { id: toastId })
            setLocalChecked(localChecked) // rollback
        } else {
            toast.success('Estado actualizado', { id: toastId })
        }
    }

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar esta tarea?')) return
        setDeleting(true)
        const res = await deleteTask(task.id)
        if (res.error) toast.error(res.error)
        else toast.success('Tarea eliminada')
    }

    const priorityColors: Record<string, string> = {
        low: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        high: 'text-destructive bg-destructive/10 border-destructive/20'
    }

    const categoryText: Record<string, string> = { personal: 'Personal', work: 'Trabajo', home: 'Hogar' }
    const priorityText: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta' }

    if (deleting) return null

    return (
        <label className={`block group ${submitting ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
            <Card className={`glass p-4 border transition-colors hover:border-primary/50 relative overflow-hidden ${localChecked ? 'opacity-60 bg-muted/20' : ''}`}>
                <div className="flex gap-4">
                    <div className="pt-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStatus() }}>
                        <Checkbox
                            id={`task-${task.id}`}
                            checked={localChecked}
                            className={`h-5 w-5 rounded-md ${localChecked ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white' : ''}`}
                        />
                    </div>
                    <div className="flex-1 min-w-0" onClick={handleToggleStatus}>
                        <div className={`text-base font-semibold leading-none mb-2 ${localChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className={`text-xs h-5 ${priorityColors[task.priority] || priorityColors.medium}`}>
                                {priorityText[task.priority]}
                            </Badge>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-sm">
                                {categoryText[task.category]}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete() }}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {task.due_date && (
                            <div className="text-[10px] text-muted-foreground flex items-center bg-background/50 px-2 py-1 rounded-sm mt-1">
                                <Calendar className="mr-1 h-3 w-3" />
                                {formatDate(new Date(task.due_date))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </label>
    )
}
