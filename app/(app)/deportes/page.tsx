import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, CalendarDays, Timer, Flame, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DeportesResumenPage() {
    const supabase = await createClient()

    // Resumen Gym
    const { data: gymSessions } = await supabase
        .from('gym_sessions')
        .select('*')
        .order('date', { ascending: false })
        .limit(10)

    const sessions = (gymSessions || []) as any[]

    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const weeklySessions = sessions.filter(s => {
        const d = new Date(s.date)
        return d >= sevenDaysAgo && d <= today
    })

    // Resumen Clases
    const { data: sportClasses } = await supabase
        .from('sport_classes')
        .select('*')

    const classesCount = (sportClasses || []).length

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deportes & Fitness</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor de tu actividad física y constancia.
                    </p>
                </div>
            </div>

            {/* Quick Links / Navigation Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/deportes/clases">
                    <Card className="glass card-hover border-blue-500/20 bg-blue-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-blue-500 group-hover:underline">
                                Clases Fijas
                            </CardTitle>
                            <CalendarDays className="h-6 w-6 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{classesCount} actividades</div>
                            <p className="text-xs text-blue-500/70 mt-1">Agendadas en la semana</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/deportes/gimnasio">
                    <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-emerald-500 group-hover:underline">
                                Gimnasio
                            </CardTitle>
                            <Dumbbell className="h-6 w-6 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">{weeklySessions.length} Logs</div>
                            <p className="text-xs text-emerald-500/70 mt-1">Últimos 7 días</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/deportes/timer">
                    <Card className="glass card-hover border-orange-500/20 bg-orange-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-orange-500 group-hover:underline">
                                Timer Pro
                            </CardTitle>
                            <Timer className="h-6 w-6 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-500">Stopwatch</div>
                            <p className="text-xs text-orange-500/70 mt-1">Cronómetro & Tabata listos para entrenar</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* WIDGET Constancia */}
                <Card className="glass border-border/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Flame className="h-5 w-5 text-orange-500" /> Racha de Movimiento
                        </CardTitle>
                        <CardDescription>Resumen de tu última actividad física registrada</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sessions.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                <div className="p-4 border border-border/50 rounded-lg bg-muted/10">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-emerald-500">Última visita al Gym</span>
                                        <span className="text-sm font-mono">{new Date(sessions[0].date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-emerald-500/20 text-emerald-500 p-2 rounded-lg text-center font-bold text-sm tracking-widest mt-2 uppercase">
                                    ¡Sigue así, estás activo!
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-muted-foreground bg-muted/5 rounded-lg border border-dashed text-sm">
                                No has registrado actividad reciente. Ingresa a "Gimnasio" para sumar tu primera visita de la semana.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* PROGRESO ESTADISTICO WIDGET FASCIA 3 */}
                <Card className="glass border-border/50 opacity-70">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                            <TrendingUp className="h-5 w-5" /> Estadísticas Avanzadas
                        </CardTitle>
                        <CardDescription>Métricas de composición corporal (Fase 3)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 border-t border-border/20">
                        <p className="text-sm text-center">Aquí se integrarán en la próxima actualización gráficos de Recharts sobre aumentos de kilos levantados, volumen total semanal y trackeo de medidas o peso corporal.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
