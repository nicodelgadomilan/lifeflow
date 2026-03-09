import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, CalendarCheck2, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GymLogForm } from '@/components/deportes/gym-form'
import { formatDate } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'

export default async function GimnasioPage() {
    const supabase = await createClient()

    // 1. Fetch Gym Sessions
    const { data: gymSessions } = await supabase
        .from('gym_sessions')
        .select('*')
        .order('date', { ascending: false })
        .limit(30) // last 30 logs

    const sessions = (gymSessions || []) as any[]

    // Calcular días asistidos en los últimos 7 días
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const thisWeekSessions = sessions.filter(s => {
        const d = new Date(s.date)
        return d >= sevenDaysAgo && d <= today
    })

    const streak = thisWeekSessions.length

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
                        <CardTitle className="text-sm font-medium text-emerald-500">
                            Últimos 7 Días
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <Flame className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{streak} Sesiones</div>
                    </CardContent>
                </Card>
                <Card className="glass card-hover hidden md:block">
                    <CardContent className="h-full flex items-center justify-center p-6 text-center opacity-60">
                        <p className="text-sm text-muted-foreground font-medium">✨ Visualización de Gráficos de Peso en Fase 3</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* HISTORIAL DE LOGS */}
                <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-emerald-500/10 min-h-[500px]">
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
                                        <p className="text-sm border-emerald-500">Aún no registraste ninguna asistencia.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sessions.map((log) => (
                                            <div key={log.id} className="p-4 rounded-lg border-l-4 border-emerald-500/50 bg-muted/20 relative group transition-colors hover:bg-muted/40">
                                                <div className="flex justify-between items-start mb-2 border-b border-border/40 pb-2">
                                                    <div>
                                                        <p className="font-semibold text-base">{formatDate(new Date(log.date))}</p>
                                                    </div>
                                                    {log.duration_min && (
                                                        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                                            {log.duration_min} min
                                                        </Badge>
                                                    )}
                                                </div>
                                                {log.notes ? (
                                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap mt-2">{log.notes}</p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground/60 italic mt-2">Sin registro de rutina. Solo el presentismo de asistencia.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* TRACKER SEMANAL */}
                <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <Card className="glass h-fit border-emerald-500/20">
                        <CardHeader className="bg-emerald-500/5 pb-4 border-b border-border/50">
                            <CardTitle className="text-emerald-500 text-lg">Asistencia de la Semana</CardTitle>
                            <CardDescription>
                                ¿Qué días moviste?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-7 gap-1 lg:gap-2">
                                {Array.from({ length: 7 }).map((_, i) => {
                                    // Determinar dia (L a D)
                                    // 1 to 7 (L a D)
                                    const d = new Date()
                                    // Esto es una simplificación visual
                                    const dayName = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][i]
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="text-[10px] font-medium text-muted-foreground">{dayName}</div>
                                            {/* Dummy dot visualization */}
                                            <div className={`w-8 h-8 rounded-full flex justify-center items-center border ${streak > i ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-muted/10 border-border/50 text-muted-foreground/30'}`}>
                                                {streak > i ? '✓' : ''}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
