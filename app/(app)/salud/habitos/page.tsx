import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Droplets, Target, Coffee, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { HabitosForm } from '@/components/salud/habitos-form'
import { HabitItem } from '@/components/salud/habitos-item'

export default async function HabitosPage() {
    const supabase = await createClient()

    // 1. Fetch Todos los habitos ddl usuario
    const { data: habs } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true })

    const habits = (habs || []) as any[]

    // 2. Fetch logs para HOY
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const { data: logs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('date', today)

    const completedLogs = (logs || []).filter((l: any) => l.completed)
    const completedHabitIds = new Set(completedLogs.map((l: any) => l.habit_id))

    // Progreso
    const total = habits.length
    const done = completedHabitIds.size
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0

    // Agrupaciones para presentacion
    const morning = habits.filter(h => h.time_of_day === 'morning')
    const afternoon = habits.filter(h => h.time_of_day === 'afternoon')
    const evening = habits.filter(h => h.time_of_day === 'evening')
    const any = habits.filter(h => h.time_of_day === 'any')

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tracker de Hábitos</h1>
                    <p className="text-muted-foreground mt-1">
                        Día de hoy: {new Date().toLocaleDateString()}
                    </p>
                </div>
                <HabitosForm />
            </div>

            {/* Metricas Rapidas */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-500">
                            Puntuación Diaria
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <Target className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{percentage}%</div>
                        <p className="text-xs text-emerald-500/70 mt-1">{done} de {total} rutinas completadas</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover">
                    <CardContent className="h-full flex flex-col justify-center items-center text-center p-6 space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">✨ "La constancia es la clave del progreso."</p>
                        <div className="w-full bg-muted/50 rounded-full h-2.5 mt-2">
                            <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 space-y-8">
                {total === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center opacity-50 bg-muted/5 rounded-2xl border border-dashed border-emerald-500/30">
                        <Droplets className="h-12 w-12 text-emerald-500 mb-4 opacity-50" />
                        <p className="max-w-[250px] text-sm font-medium text-emerald-500/80">No tienes ningun hábito configurado. Empieza agregando uno arriba a la derecha.</p>
                    </div>
                ) : (
                    <>
                        {morning.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-orange-500 mb-4">
                                    <Coffee className="h-4 w-4" /> Mañana
                                </h3>
                                <div className="space-y-3">
                                    {morning.map(h => <HabitItem key={h.id} habit={h} todayCompleted={completedHabitIds.has(h.id)} todayDateStr={today} />)}
                                </div>
                            </section>
                        )}

                        {afternoon.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-500 mb-4">
                                    <Droplets className="h-4 w-4" /> Tarde
                                </h3>
                                <div className="space-y-3">
                                    {afternoon.map(h => <HabitItem key={h.id} habit={h} todayCompleted={completedHabitIds.has(h.id)} todayDateStr={today} />)}
                                </div>
                            </section>
                        )}

                        {evening.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-500 mb-4">
                                    <Moon className="h-4 w-4" /> Noche
                                </h3>
                                <div className="space-y-3">
                                    {evening.map(h => <HabitItem key={h.id} habit={h} todayCompleted={completedHabitIds.has(h.id)} todayDateStr={today} />)}
                                </div>
                            </section>
                        )}

                        {any.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    <CheckCircle2 className="h-4 w-4" /> Durante el día
                                </h3>
                                <div className="space-y-3">
                                    {any.map(h => <HabitItem key={h.id} habit={h} todayCompleted={completedHabitIds.has(h.id)} todayDateStr={today} />)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
