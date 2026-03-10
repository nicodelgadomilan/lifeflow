import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Droplets, Target, Coffee, Moon, Flame, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { HabitosForm } from '@/components/salud/habitos-form'
import { HabitItem } from '@/components/salud/habitos-item'

export default async function HabitosPage() {
    const supabase = await createClient()

    // Fetch hábitos
    const { data: habs } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true })

    const habits = (habs || []) as any[]

    // Fetch logs de hoy
    const today = new Date().toISOString().slice(0, 10)
    const { data: logs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('date', today)

    // Fetch últimos 8 días de logs para streaks
    const eightDaysAgo = new Date()
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 7)
    const { data: recentLogs } = await supabase
        .from('habit_logs')
        .select('habit_id, date, completed')
        .gte('date', eightDaysAgo.toISOString().slice(0, 10))
        .eq('completed', true)

    const completedLogs = (logs || []).filter((l: any) => l.completed)
    const completedHabitIds = new Set(completedLogs.map((l: any) => l.habit_id))

    // Calcular streaks por hábito
    const recentLogsArr = (recentLogs || []) as any[]
    function getStreak(habitId: string): number {
        let streak = 0
        const d = new Date()
        for (let i = 0; i < 8; i++) {
            const dateStr = new Date(d.getTime() - i * 86400000).toISOString().slice(0, 10)
            const hasLog = recentLogsArr.some(l => l.habit_id === habitId && l.date === dateStr)
            if (hasLog) streak++
            else if (i > 0) break // only break streak if not today (today hasn't happened yet)
        }
        return streak
    }

    // Últimos 7 días para vista semanal
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().slice(0, 10)
    })
    const dayLabels = last7Days.map(d => {
        const date = new Date(d)
        return date.toLocaleDateString('es-AR', { weekday: 'short' }).slice(0, 3)
    })

    const total = habits.length
    const done = completedHabitIds.size
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0

    const morning = habits.filter(h => h.time_of_day === 'morning')
    const afternoon = habits.filter(h => h.time_of_day === 'afternoon')
    const evening = habits.filter(h => h.time_of_day === 'evening')
    const any = habits.filter(h => h.time_of_day === 'any')

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tracker de Hábitos</h1>
                    <p className="text-muted-foreground mt-1">
                        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <HabitosForm />
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-500">Puntuación Diaria</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <Target className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{percentage}%</div>
                        <p className="text-xs text-emerald-500/70 mt-1">{done} de {total} rutinas completadas</p>
                        <div className="w-full bg-muted/40 rounded-full h-1.5 mt-2">
                            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-orange-500/20 bg-orange-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-500">Mejor Racha</CardTitle>
                        <div className="p-2 bg-orange-500/10 rounded-full">
                            <Flame className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-500">
                            {habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.id))) : 0}
                            <span className="text-lg ml-1">días</span>
                        </div>
                        <p className="text-xs text-orange-500/70 mt-1">Racha consecutiva más larga</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Hábitos Activos</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground mt-1">Rutinas configuradas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Vista semanal (7 días × N hábitos) */}
            {habits.length > 0 && (
                <Card className="glass border-border/30 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/50 bg-muted/5">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary opacity-70" />
                            Vista Semanal de Completados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead>
                                <tr>
                                    <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4 w-40">Hábito</th>
                                    {dayLabels.map((label, i) => (
                                        <th key={i} className={`text-center text-xs font-medium pb-3 w-10 ${i === 6 ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {label}
                                        </th>
                                    ))}
                                    <th className="text-center text-xs text-orange-500 font-medium pb-3 w-16 pl-2">Racha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habits.map(h => {
                                    const streak = getStreak(h.id)
                                    return (
                                        <tr key={h.id} className="border-t border-border/20">
                                            <td className="py-2 pr-4">
                                                <span className="text-sm font-medium truncate max-w-[140px] block">{h.name}</span>
                                            </td>
                                            {last7Days.map((dateStr, i) => {
                                                const isCompleted = recentLogsArr.some(l => l.habit_id === h.id && l.date === dateStr)
                                                const isToday = i === 6
                                                return (
                                                    <td key={dateStr} className="py-2 text-center">
                                                        <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs transition-all
                                                            ${isCompleted
                                                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50'
                                                                : isToday
                                                                    ? 'border border-dashed border-primary/30 text-muted-foreground/30'
                                                                    : 'bg-muted/20 text-muted-foreground/20'
                                                            }`}>
                                                            {isCompleted ? '✓' : ''}
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                            <td className="py-2 pl-2 text-center">
                                                {streak > 0 && (
                                                    <span className="text-xs font-bold text-orange-500 flex items-center justify-center gap-0.5">
                                                        <Flame className="h-3 w-3" />{streak}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {/* Hábitos por momento del día */}
            <div className="mt-4 space-y-8">
                {total === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center opacity-50 bg-muted/5 rounded-2xl border border-dashed border-emerald-500/30">
                        <Droplets className="h-12 w-12 text-emerald-500 mb-4 opacity-50" />
                        <p className="max-w-[250px] text-sm font-medium text-emerald-500/80">No tenés ningún hábito configurado. Empezá agregando uno.</p>
                    </div>
                ) : (
                    <>
                        {morning.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-orange-500 mb-4">
                                    <Coffee className="h-4 w-4" /> Mañana
                                </h3>
                                <div className="space-y-3">
                                    {morning.map(h => (
                                        <div key={h.id} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <HabitItem habit={h} todayCompleted={completedHabitIds.has(h.id)} todayDateStr={today} />
                                            </div>
                                            {getStreak(h.id) > 1 && (
                                                <div className="flex items-center gap-1 text-xs text-orange-500 font-bold min-w-12">
                                                    <Flame className="h-3.5 w-3.5" />{getStreak(h.id)}d
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {afternoon.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-500 mb-4">
                                    <Droplets className="h-4 w-4" /> Tarde
                                </h3>
                                <div className="space-y-3">
                                    {afternoon.map(h => (
                                        <div key={h.id} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <HabitItem habit={h} todayCompleted={completedHabitIds.has(h.id)} todayDateStr={today} />
                                            </div>
                                            {getStreak(h.id) > 1 && (
                                                <div className="flex items-center gap-1 text-xs text-orange-500 font-bold min-w-12">
                                                    <Flame className="h-3.5 w-3.5" />{getStreak(h.id)}d
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {evening.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-500 mb-4">
                                    <Moon className="h-4 w-4" /> Noche
                                </h3>
                                <div className="space-y-3">
                                    {evening.map(h => (
                                        <div key={h.id} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <HabitItem habit={h} todayCompleted={completedHabitIds.has(h.id)} todayDateStr={today} />
                                            </div>
                                            {getStreak(h.id) > 1 && (
                                                <div className="flex items-center gap-1 text-xs text-orange-500 font-bold min-w-12">
                                                    <Flame className="h-3.5 w-3.5" />{getStreak(h.id)}d
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {any.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    <CheckCircle2 className="h-4 w-4" /> Durante el día
                                </h3>
                                <div className="space-y-3">
                                    {any.map(h => (
                                        <div key={h.id} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <HabitItem habit={h} todayCompleted={completedHabitIds.has(h.id)} todayDateStr={today} />
                                            </div>
                                            {getStreak(h.id) > 1 && (
                                                <div className="flex items-center gap-1 text-xs text-orange-500 font-bold min-w-12">
                                                    <Flame className="h-3.5 w-3.5" />{getStreak(h.id)}d
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
