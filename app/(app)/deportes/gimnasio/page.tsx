import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, CalendarCheck2, Flame, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GymLogForm } from '@/components/deportes/gym-form'
import { formatDate } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { GymProgressChart } from '@/components/deportes/gym-progress-chart'

export default async function GimnasioPage() {
    const supabase = await createClient()

    // Gym Sessions
    const { data: gymSessions } = await supabase
        .from('gym_sessions')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)

    // Workout log sets para progresión por ejercicio
    const { data: logSetsRaw } = await supabase
        .from('workout_log_sets')
        .select('date:created_at, exercise_name, weight_kg, reps')
        .order('created_at', { ascending: false })
        .limit(200)

    const sessions = (gymSessions || []) as any[]
    const logSets = (logSetsRaw || []) as any[]

    // Calcular días asistidos en los últimos 7 días
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    // Mapa de fechas de esta semana con sesión
    const thisWeekSessionDates = new Set(
        sessions
            .filter(s => {
                const d = new Date(s.date)
                return d >= sevenDaysAgo && d <= today
            })
            .map(s => s.date)
    )
    const streak = thisWeekSessionDates.size

    // Get real day attendance for this week (Mon-Sun)
    const startOfCurrentWeek = new Date()
    const dayOfWeek = startOfCurrentWeek.getDay() // 0=Sun
    const monday = new Date(startOfCurrentWeek)
    monday.setDate(startOfCurrentWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dateStr = d.toISOString().slice(0, 10)
        const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        const hasSession = sessions.some(s => s.date === dateStr)
        return { label: dayNames[i], dateStr, hasSession, isToday: d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10) }
    })

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gimnasio & Log</h1>
                    <p className="text-muted-foreground mt-1">
                        Lleva el registro de asistencia semanal, pesos movidos y rutinas.
                    </p>
                </div>
                <GymLogForm />
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-500">Esta Semana</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <Flame className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{streak} <span className="text-lg">Sesiones</span></div>
                        <p className="text-xs text-muted-foreground mt-1">{7 - streak} días restantes esta semana</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Sesiones</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{sessions.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registros históricos</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Asistencia Esta Semana</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="grid grid-cols-7 gap-1">
                            {weekDays.map((day) => (
                                <div key={day.dateStr} className="flex flex-col items-center gap-1">
                                    <div className="text-[9px] font-medium text-muted-foreground">{day.label}</div>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-all
                                        ${day.hasSession ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 font-bold' :
                                            day.isToday ? 'border-primary/50 border-dashed text-muted-foreground/50' :
                                                'bg-muted/10 border-border/30 text-muted-foreground/20'}`}
                                    >
                                        {day.hasSession ? '✓' : day.isToday ? '·' : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* HISTORIAL DE LOGS */}
                <div className="md:col-span-7 flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-emerald-500/10 min-h-[400px]">
                        <CardHeader className="border-b border-border/50 bg-emerald-500/5 flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarCheck2 className="h-5 w-5 text-emerald-500" />
                                    Histórico de Entrenamientos
                                </CardTitle>
                                <CardDescription>Tus sesiones por fecha</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {sessions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-full border border-dashed rounded-xl mt-4">
                                        <Dumbbell className="h-12 w-12 text-emerald-500 mb-4 opacity-50" />
                                        <p className="text-sm">Aún no registraste ninguna asistencia.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sessions.map((log) => (
                                            <div key={log.id} className="p-4 rounded-lg border-l-4 border-emerald-500/50 bg-muted/20 relative group transition-colors hover:bg-muted/40">
                                                <div className="flex justify-between items-start mb-2 border-b border-border/40 pb-2">
                                                    <p className="font-semibold text-base">{formatDate(new Date(log.date))}</p>
                                                    {log.duration_min && (
                                                        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                                            {log.duration_min} min
                                                        </Badge>
                                                    )}
                                                </div>
                                                {log.notes ? (
                                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap mt-2">{log.notes}</p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground/60 italic mt-2">Sin notas de rutina.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* GRÁFICO PROGRESIÓN DE PESO */}
                <div className="md:col-span-5 flex flex-col gap-6">
                    <Card className="glass border-primary/10 p-5">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Progresión por Ejercicio
                            </CardTitle>
                            <CardDescription>Top ejercicios con registro de peso (kg)</CardDescription>
                        </CardHeader>
                        <GymProgressChart sets={logSets} />
                    </Card>
                </div>
            </div>
        </div>
    )
}
