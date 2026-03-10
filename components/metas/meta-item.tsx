'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Target, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react'
import { deleteGoal, updateGoalProgress, toggleGoalStatus } from '@/app/(app)/actions/metas'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MilestoneList } from './milestone-list'

interface MilestoneData {
    id: string
    title: string
    is_done: boolean
    due_date?: string | null
}

interface MetaProps {
    meta: any
    milestones?: MilestoneData[]
}

export function MetaItem({ meta, milestones = [] }: MetaProps) {
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(meta.progress || 0)

    const isComplete = meta.status === 'completed' || progress >= 100

    async function handleProgress(add: number) {
        if (isComplete) return
        let newP = progress + add
        if (newP > 100) newP = 100
        if (newP < 0) newP = 0
        setProgress(newP)

        setLoading(true)
        const res = await updateGoalProgress(meta.id, newP)

        // auto-complete
        if (newP === 100 && res.success) {
            await toggleGoalStatus(meta.id, 'completed')
            toast.success('¡Felicidades! Meta completada 🎉')
        }
        setLoading(false)
    }

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar este objetivo?')) return
        setLoading(true)
        const toastId = toast.loading('Eliminando...')
        const res = await deleteGoal(meta.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Eliminado', { id: toastId })
    }

    // Decorate by Type
    const typeStyles: Record<string, { icon: any, label: string, color: string }> = {
        'goal': { icon: Target, label: 'Meta', color: 'text-primary' },
        'project': { icon: TrendingUp, label: 'Proyecto', color: 'text-indigo-500' },
        'idea': { icon: Lightbulb, label: 'Idea', color: 'text-amber-500' }
    }

    const tStyle = typeStyles[meta.type] || typeStyles['goal']
    const IconCmp = isComplete ? CheckCircle : tStyle.icon

    // Status color
    const baseBorderColor = isComplete ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/40 hover:bg-muted/10'

    return (
        <Card className={`glass relative group transition-all duration-500 ${baseBorderColor} ${loading && !isComplete ? 'opacity-70' : ''}`}>
            {isComplete && (
                <div className="absolute top-0 right-0 w-max h-full overflow-hidden pointer-events-none opacity-20 z-0">
                    <span className="text-[100px] absolute -right-4 -top-8 text-emerald-500 font-bold select-none">100%</span>
                </div>
            )}

            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4 z-10 relative">
                <div className="flex w-full items-start gap-4 flex-1">
                    <div className={`mt-1 w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center bg-muted/30 ${isComplete ? 'text-emerald-500 bg-emerald-500/20 shadow-emerald-500/20 shadow-lg' : tStyle.color}`}>
                        <IconCmp className={`w-5 h-5 ${isComplete ? 'animate-bounce-slow' : ''}`} />
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{tStyle.label}</span>
                            {isComplete && <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">Logrado</span>}
                        </div>
                        <h3 className={`font-bold text-foreground sm:text-lg mb-1 ${isComplete ? 'line-through opacity-70' : ''}`}>
                            {meta.title}
                        </h3>
                        {meta.description && (
                            <p className="text-sm text-muted-foreground mb-3 sm:max-w-[80%] leading-relaxed">
                                {meta.description}
                            </p>
                        )}

                        {/* BARRA PROGRESO */}
                        {!isComplete && (
                            <div className="mt-4 pt-4 border-t border-border/50 max-w-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Progreso manual</span>
                                    <span className="text-xs font-bold font-mono">{progress}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-700 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="icon" className="h-6 w-6 text-xs bg-muted/20 hover:bg-muted text-muted-foreground" onClick={() => handleProgress(-10)}>-</Button>
                                        <Button variant="outline" size="icon" className="h-6 w-6 text-xs bg-muted/20 hover:bg-muted text-foreground" onClick={() => handleProgress(10)}>+</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MILESTONES */}
                        <MilestoneList
                            goalId={meta.id}
                            milestones={milestones}
                            isGoalComplete={isComplete}
                        />
                    </div>
                </div>

                <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/50 sm:border-l sm:pl-4">
                    <div className="text-left sm:text-right w-full">
                        {meta.target_date && !isComplete && (
                            <>
                                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Fecha Límite</span>
                                <span className="text-sm font-medium whitespace-nowrap">{new Date(meta.target_date).toLocaleDateString()}</span>
                            </>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 sm:w-full justify-center sm:justify-end text-xs"
                        onClick={handleDelete}
                        size="sm"
                    >
                        <Trash2 className="h-3 w-3 mr-2" /> Eliminar
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
