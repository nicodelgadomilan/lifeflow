'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, ListChecks } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addWorkRoutine, toggleWorkRoutineLog, deleteWorkRoutine } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WorkRoutinesWidgetProps {
    routines: any[]
}

export function WorkRoutinesWidget({ routines }: WorkRoutinesWidgetProps) {
    const [weekOffset, setWeekOffset] = useState(0)
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newRoutineName, setNewRoutineName] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const supabase = createClient()

    // Calculate Dates for the week
    const weekDates = getWeekDates(weekOffset)

    function getWeekDates(offsetWeeks: number) {
        const today = new Date()
        const currentDay = today.getDay() // 0 = Sunday
        const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        sunday.setDate(sunday.getDate() - currentDay + (offsetWeeks * 7))

        const week = []
        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday)
            d.setDate(sunday.getDate() + i)
            week.push(d)
        }
        return week
    }

    const formatDateStr = (d: Date) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}` // YYYY-MM-DD
    }

    const loadLogs = async (dates: Date[]) => {
        setLoading(true)
        const dateStrings = dates.map(d => formatDateStr(d))

        const { data } = await supabase
            .from('work_routine_logs')
            .select('*')
            .in('date', dateStrings)

        if (data) setLogs(data.filter((l: any) => l.completed))
        setLoading(false)
    }

    useEffect(() => {
        if (routines.length > 0) {
            loadLogs(weekDates)
        } else {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekOffset, routines])

    const isCompleted = (routineId: string, dateStr: string) => {
        return logs.some(l => l.routine_id === routineId && l.date === dateStr)
    }

    const handleToggle = async (routineId: string, dateStr: string) => {
        const currentlyCompleted = isCompleted(routineId, dateStr)

        // Optimistic UI update
        if (currentlyCompleted) {
            setLogs(prev => prev.filter(l => !(l.routine_id === routineId && l.date === dateStr)))
        } else {
            setLogs(prev => [...prev, { routine_id: routineId, date: dateStr, completed: true }])
        }

        const res = await toggleWorkRoutineLog(routineId, dateStr, !currentlyCompleted)

        if (res.error) {
            toast.error('Error al actualizar rutina')
            // Revert Optimistic
            loadLogs(weekDates)
        }
    }

    const handleAddRoutine = async () => {
        if (!newRoutineName.trim()) return
        setIsSubmitting(true)
        const res = await addWorkRoutine(newRoutineName)
        setIsSubmitting(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Checklist creado con éxito')
            setNewRoutineName('')
            setIsAddOpen(false)
        }
    }

    const handleDeleteRoutine = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el checklist "${name}"? Se borrará todo el historial.`)) return
        toast.loading('Eliminando...', { id: 'delete' })
        const res = await deleteWorkRoutine(id)
        if (res.error) {
            toast.error(res.error, { id: 'delete' })
        } else {
            toast.success('Rutina eliminada', { id: 'delete' })
        }
    }

    const dayHeaders = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

    let weekLabel = 'Esta semana'
    if (weekOffset === -1) weekLabel = 'Semana pasada'
    else if (weekOffset === 1) weekLabel = 'Próxima semana'
    else if (weekOffset !== 0) weekLabel = `Semana ${weekOffset > 0 ? '+' : ''}${weekOffset}`

    // Ensure we limit habits if they have too many on resume page
    const displayRoutines = routines.slice(0, 8)

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/10 dark:bg-indigo-500/20 p-2.5 rounded-xl text-indigo-500">
                        <ListChecks className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Checklist Diario</h2>
                        <p className="text-xs text-muted-foreground">Rutinas de trabajo recurrentes</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center justify-between bg-card rounded-2xl p-1 px-3 border border-border/40 shadow-sm w-full sm:w-auto">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl hover:bg-muted" onClick={() => setWeekOffset(prev => prev - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-semibold text-primary px-3">{weekLabel}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl hover:bg-muted" onClick={() => setWeekOffset(prev => prev + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger render={
                            <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl h-9 px-3 shadow-md shrink-0">
                                <Plus className="h-4 w-4 mr-1" /> Nuevo
                            </Button>
                        } />
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Nuevo Checklist Diario</DialogTitle>
                                <DialogDescription>
                                    Añade una rutina o tarea recurrente para controlar todos los días de trabajo.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre de la tarea</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ej: Revisar correos de clientes, Actualizar CRM, etc."
                                        value={newRoutineName}
                                        onChange={(e) => setNewRoutineName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddRoutine() }}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                                <Button onClick={handleAddRoutine} disabled={!newRoutineName.trim() || isSubmitting} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                                    {isSubmitting ? 'Guardando...' : 'Crear'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex flex-col flex-1 pb-2 w-full overflow-hidden">
                {routines.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm flex-col gap-3 h-[200px] border border-dashed border-border/60 rounded-3xl bg-muted/20">
                        <ListChecks className="h-10 w-10 text-muted-foreground/30" />
                        <p>No tienes tareas recurrentes creadas.</p>
                        <Button variant="outline" className="rounded-xl shadow-sm border-indigo-500/20 text-indigo-500 hover:bg-indigo-50" size="sm" onClick={() => setIsAddOpen(true)}>
                            Crear mi primer checklist
                        </Button>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto select-none rounded-3xl border border-border/40 bg-card p-4 sm:p-6 shadow-sm">
                        <div className="min-w-[500px] flex flex-col w-full h-full">
                            {/* Días Header */}
                            <div className="flex items-center mb-6 w-full border-b border-border/60 pb-4">
                                <div className="w-40 sm:w-[200px] shrink-0" />
                                <div className="flex justify-between flex-1 gap-1">
                                    {weekDates.map((date, idx) => {
                                        const isToday = formatDateStr(date) === formatDateStr(new Date())
                                        return (
                                            <div key={idx} className="flex flex-col items-center flex-1">
                                                <span className={`mb-1 text-[15px] font-semibold tracking-tight ${isToday ? 'text-indigo-500 dark:text-indigo-400' : 'text-foreground/80'}`}>
                                                    {String(date.getDate()).padStart(2, '0')}
                                                </span>
                                                <span className={`uppercase text-[10px] font-black tracking-widest ${isToday ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded-full' : 'text-muted-foreground'}`}>
                                                    {dayHeaders[idx]}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Hábitos Rows */}
                            <div className={`space-y-4 sm:space-y-5 flex-1 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                                {displayRoutines.map(routine => (
                                    <div key={routine.id} className="flex items-center w-full group relative">
                                        <div className="w-40 sm:w-[200px] shrink-0 text-[13px] sm:text-sm font-semibold pr-4 truncate text-foreground/80 group-hover:text-indigo-600 transition-colors cursor-default select-text flex items-center justify-between">
                                            <span className="truncate" title={routine.name}>{routine.name}</span>
                                            <button
                                                onClick={() => handleDeleteRoutine(routine.id, routine.name)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between flex-1 gap-1">
                                            {weekDates.map((date, idx) => {
                                                const dateStr = formatDateStr(date)
                                                const completed = isCompleted(routine.id, dateStr)
                                                return (
                                                    <div key={idx} className="flex justify-center flex-1">
                                                        <button
                                                            onClick={() => handleToggle(routine.id, dateStr)}
                                                            className={`h-9 w-9 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-300
                                                                ${completed
                                                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                                                    : 'border-border/60 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-transparent'
                                                                }`}
                                                        >
                                                            <Check className="h-5 w-5" strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
