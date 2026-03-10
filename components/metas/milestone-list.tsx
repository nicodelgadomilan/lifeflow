'use client'

import { useState, useTransition } from 'react'
import { Check, Plus, Trash2, Flag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addMilestone, toggleMilestone, deleteMilestone } from '@/app/(app)/actions/metas'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Milestone {
    id: string
    title: string
    is_done: boolean
    due_date?: string | null
}

interface MilestoneListProps {
    goalId: string
    milestones: Milestone[]
    isGoalComplete?: boolean
}

export function MilestoneList({ goalId, milestones, isGoalComplete }: MilestoneListProps) {
    const [adding, setAdding] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDate, setNewDate] = useState('')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const total = milestones.length
    const done = milestones.filter(m => m.is_done).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

    async function handleAdd() {
        if (!newTitle.trim()) return
        startTransition(async () => {
            const res = await addMilestone(goalId, newTitle, newDate || undefined)
            if (res.error) toast.error(res.error)
            else {
                toast.success('Hito agregado')
                setNewTitle('')
                setNewDate('')
                setAdding(false)
                router.refresh()
            }
        })
    }

    async function handleToggle(id: string, current: boolean) {
        startTransition(async () => {
            const res = await toggleMilestone(id, !current)
            if (res.error) toast.error(res.error)
            else router.refresh()
        })
    }

    async function handleDelete(id: string) {
        startTransition(async () => {
            const res = await deleteMilestone(id)
            if (res.error) toast.error(res.error)
            else {
                toast.success('Hito eliminado')
                router.refresh()
            }
        })
    }

    return (
        <div className="mt-4 pt-4 border-t border-border/50">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Hitos
                    </span>
                    {total > 0 && (
                        <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground/70">
                            {done}/{total}
                        </span>
                    )}
                </div>
                {!isGoalComplete && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setAdding(v => !v)}
                    >
                        {adding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </Button>
                )}
            </div>

            {/* Progress bar */}
            {total > 0 && (
                <div className="h-1 bg-muted/50 rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}

            {/* Milestones list */}
            <div className="space-y-1.5">
                {milestones.map(m => (
                    <div
                        key={m.id}
                        className="flex items-center gap-2 group py-1 px-2 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                        <button
                            className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                ${m.is_done
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-border/60 hover:border-primary'}`}
                            onClick={() => handleToggle(m.id, m.is_done)}
                            disabled={isPending}
                        >
                            {m.is_done && <Check className="h-2.5 w-2.5" />}
                        </button>
                        <span className={`flex-1 text-sm leading-tight ${m.is_done ? 'line-through text-muted-foreground/60' : ''}`}>
                            {m.title}
                        </span>
                        {m.due_date && !m.is_done && (
                            <span className="text-[10px] font-mono text-muted-foreground/60 hidden group-hover:block">
                                {new Date(m.due_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            </span>
                        )}
                        <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-500 ml-1"
                            onClick={() => handleDelete(m.id)}
                            disabled={isPending}
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add form */}
            {adding && (
                <div className="mt-2 flex flex-col gap-2 bg-muted/20 rounded-lg p-2 border border-border/50">
                    <Input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Ej: Completar investigación..."
                        className="h-8 text-sm bg-background/60"
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                        autoFocus
                    />
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            className="h-7 text-xs bg-background/60 flex-1"
                        />
                        <Button
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={handleAdd}
                            disabled={isPending || !newTitle.trim()}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Agregar
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => { setAdding(false); setNewTitle(''); setNewDate('') }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {total === 0 && !adding && (
                <p className="text-xs text-muted-foreground/50 italic py-1">
                    Sin hitos — agregá sub-tareas para desglosar esta meta.
                </p>
            )}
        </div>
    )
}
