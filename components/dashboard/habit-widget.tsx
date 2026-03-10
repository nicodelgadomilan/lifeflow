'use client'

import { useState, useEffect } from 'react'
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
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto bg-background/60 backdrop-blur-md rounded-2xl p-1.5 px-3 border border-border/60 shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted" onClick={() => setWeekOffset(prev => prev - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold text-primary px-4 hidden sm:inline-block">{weekLabel}</span>
                    <span className="text-sm font-semibold text-primary px-4 sm:hidden">{weekLabel.substring(0, 15)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted" onClick={() => setWeekOffset(prev => prev + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Link href="/salud/habitos">
                    <Button variant="outline" size="sm" className="bg-primary/5 text-primary hover:bg-primary/10 h-10 px-5 rounded-2xl border-primary/20 font-bold w-full sm:w-auto transition-colors">
                        Administrar Hábitos
                    </Button>
                </Link>
            </div>
            <div className="flex flex-col flex-1 pb-2 w-full overflow-hidden">

                {habits.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm flex-col gap-3 h-[200px] border border-dashed border-border/60 rounded-3xl bg-muted/20">
                        <p>Aún no tienes hábitos registrados.</p>
                        <Link href="/salud/habitos">
                            <Button className="bg-primary/90 text-white hover:bg-primary rounded-xl transition-all shadow-md" size="sm">Cargar Primer Hábito</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto select-none rounded-3xl border border-border/50 bg-background/50 backdrop-blur-md p-4 sm:p-6 shadow-sm">
                        <div className="min-w-[420px] flex flex-col w-full h-full">
                            {/* Días Header */}
                            <div className="flex items-center mb-6 w-full border-b border-border/60 pb-4">
                                <div className="w-28 sm:w-[160px] shrink-0" />
                                <div className="flex justify-between flex-1 gap-1">
                                    {weekDates.map((date, idx) => {
                                        const isToday = formatDateStr(date) === formatDateStr(new Date())
                                        return (
                                            <div key={idx} className="flex flex-col items-center flex-1">
                                                <span className={`mb-1 text-[15px] font-semibold tracking-tight ${isToday ? 'text-primary' : 'text-foreground/80'}`}>
                                                    {String(date.getDate()).padStart(2, '0')}
                                                </span>
                                                <span className={`uppercase text-[10px] font-black tracking-widest ${isToday ? 'bg-primary/10 text-primary px-2 py-0.5 rounded-full' : 'text-muted-foreground'}`}>
                                                    {dayHeaders[idx]}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Hábitos Rows */}
                            <div className={`space-y-4 sm:space-y-5 flex-1 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                                {displayHabits.map(habit => (
                                    <div key={habit.id} className="flex items-center w-full group">
                                        <div className="w-28 sm:w-[160px] shrink-0 text-[13px] sm:text-sm font-semibold pr-2 truncate text-foreground/80 group-hover:text-primary transition-colors cursor-default">
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
                                                            className={`h-9 w-9 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-300
                                                                ${completed
                                                                    ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
                                                                    : 'border-border/60 hover:border-primary/50 hover:bg-primary/5 text-transparent'
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

                            {habits.length > 5 && (
                                <div className="mt-6 text-center border-t border-border/50 pt-4">
                                    <Link href="/salud/habitos">
                                        <span className="text-sm text-primary font-bold hover:underline transition-colors cursor-pointer">
                                            Ver {habits.length - 5} hábitos más
                                        </span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
