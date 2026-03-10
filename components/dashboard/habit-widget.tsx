'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toggleHabitLog } from '@/app/(app)/actions/salud'
import { toast } from 'sonner'
import Link from 'next/link'

interface HabitWidgetProps {
    habits: any[]
}

export function HabitWidget({ habits }: HabitWidgetProps) {
    const [weekOffset, setWeekOffset] = useState(0)
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    // Calculate Dates for the week
    const weekDates = getWeekDates(weekOffset)

    // Helper functions
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
            .from('habit_logs')
            .select('*')
            .in('date', dateStrings)

        if (data) setLogs(data.filter((l: any) => l.completed))
        setLoading(false)
    }

    useEffect(() => {
        if (habits.length > 0) {
            loadLogs(weekDates)
        } else {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekOffset, habits])

    const isCompleted = (habitId: string, dateStr: string) => {
        return logs.some(l => l.habit_id === habitId && l.date === dateStr)
    }

    const handleToggle = async (habitId: string, dateStr: string) => {
        const currentlyCompleted = isCompleted(habitId, dateStr)

        // Optimistic UI update
        if (currentlyCompleted) {
            setLogs(prev => prev.filter(l => !(l.habit_id === habitId && l.date === dateStr)))
        } else {
            setLogs(prev => [...prev, { habit_id: habitId, date: dateStr, completed: true }])
        }

        const res = await toggleHabitLog(habitId, dateStr, currentlyCompleted)

        if (res.error) {
            toast.error('Error al actualizar hábito')
            // Revert Optimistic
            loadLogs(weekDates)
        }
    }

    const dayHeaders = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

    // Label for week
    let weekLabel = 'Esta semana'
    if (weekOffset === -1) weekLabel = 'Semana pasada'
    else if (weekOffset === 1) weekLabel = 'Próxima semana'
    else if (weekOffset !== 0) weekLabel = `Semana ${weekOffset > 0 ? '+' : ''}${weekOffset}`

    // Ensure we only show max 5 habits to avoid huge widget
    const displayHabits = habits.slice(0, 5)

    return (
        <Card className="glass lg:col-span-3 flex flex-col h-full bg-card/40 border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Cuadro de hábitos
                    </CardTitle>
                    <CardDescription>Seguimiento semanal</CardDescription>
                </div>
                <Link href="/salud/habitos">
                    <Button variant="secondary" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs px-3 rounded-full">
                        Agregar
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pb-6 w-full overflow-hidden">
                <div className="flex items-center justify-between mb-6 px-1 lg:pl-[120px] max-w-full">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-muted/50 hover:bg-muted" onClick={() => setWeekOffset(prev => prev - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold text-primary">{weekLabel}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-muted/50 hover:bg-muted" onClick={() => setWeekOffset(prev => prev + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {habits.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm flex-col gap-2 opacity-60 h-[200px]">
                        Aún no tienes hábitos registrados.
                        <Link href="/salud/habitos">
                            <Button variant="link" className="text-primary text-xs h-auto p-0">Crear uno ahora</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex-1 w-full overflow-x-auto select-none">
                        <div className="min-w-[340px] flex flex-col h-full">
                            {/* Días Header */}
                            <div className="flex items-center mb-4 text-[10px] text-muted-foreground font-medium w-full">
                                <div className="w-24 sm:w-[120px] shrink-0" /> {/* Espacio para el nombre del hábito */}
                                <div className="flex justify-between flex-1 gap-1">
                                    {weekDates.map((date, idx) => {
                                        const isToday = formatDateStr(date) === formatDateStr(new Date())
                                        return (
                                            <div key={idx} className="flex flex-col items-center flex-1">
                                                <span className="mb-1 leading-none text-[11px] opacity-70">
                                                    {String(date.getDate()).padStart(2, '0')}
                                                </span>
                                                <span className={`uppercase font-bold ${isToday ? 'text-primary' : ''}`}>
                                                    {dayHeaders[idx]}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Hábitos Rows */}
                            <div className={`space-y-4 flex-1 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                                {displayHabits.map(habit => (
                                    <div key={habit.id} className="flex items-center w-full">
                                        <div className="w-24 sm:w-[120px] shrink-0 text-sm font-semibold pr-2 truncate">
                                            {habit.name}
                                        </div>
                                        <div className="flex justify-between flex-1 gap-1">
                                            {weekDates.map((date, idx) => {
                                                const dateStr = formatDateStr(date)
                                                const completed = isCompleted(habit.id, dateStr)
                                                return (
                                                    <div key={idx} className="flex justify-center flex-1">
                                                        <button
                                                            onClick={() => handleToggle(habit.id, dateStr)}
                                                            className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all 
                                                                ${completed
                                                                    ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 scale-110'
                                                                    : 'border-muted-foreground/20 hover:border-rose-500/50 hover:bg-rose-500/5 text-transparent'
                                                                }`}
                                                        >
                                                            <Check className="h-4 w-4" strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {habits.length > 5 && (
                                <div className="mt-4 text-center">
                                    <Link href="/salud/habitos">
                                        <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                            + {habits.length - 5} hábitos más...
                                        </span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
