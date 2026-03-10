import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, TrendingUp, Lightbulb, Trophy, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MetaForm } from '@/components/metas/meta-form'
import { MetaItem } from '@/components/metas/meta-item'

export default async function MetasPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: goals } = await supabase
        .from('goals')
        .select('*, goal_milestones(*)')
        .eq('user_id', user.id)
        .order('status', { ascending: false })
        .order('target_date', { ascending: true })

    const list = (goals || []) as any[]

    const getCount = (t: string) => list.filter(g => g.type === t && g.status !== 'completed').length
    const completadas = list.filter(g => g.status === 'completed')

    // Muestra recientes no completadas
    const activos = list.filter(g => g.status !== 'completed')

    return (
        <div className="space-y-6 animate-fade-in mx-auto max-w-6xl pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Metas & Objetivos</h1>
                    <p className="text-muted-foreground mt-1">
                        Sigue el progreso de tus logros a mediano y largo plazo.
                    </p>
                </div>
                <MetaForm />
            </div>

            {/* FOLDERS WIDGETS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <Card className="glass card-hover border-primary/20 bg-primary/5 cursor-pointer">
                    <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                        <Target className="h-6 w-6 text-primary mb-2 opacity-80" />
                        <h4 className="font-bold text-sm text-primary">Metas Personales</h4>
                        <p className="text-xs text-muted-foreground">{getCount('goal')} en curso</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-indigo-500/20 bg-indigo-500/5 cursor-pointer">
                    <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                        <TrendingUp className="h-6 w-6 text-indigo-500 mb-2 opacity-80" />
                        <h4 className="font-bold text-sm text-indigo-500">Proyectos</h4>
                        <p className="text-xs text-muted-foreground">{getCount('project')} grandes proyectos</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-amber-500/20 bg-amber-500/5 cursor-pointer flex-1">
                    <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
                        <Lightbulb className="h-6 w-6 text-amber-500 mb-2 opacity-80" />
                        <h4 className="font-bold text-sm text-amber-500">Ideas Inspiradoras</h4>
                        <p className="text-xs text-muted-foreground">{getCount('idea')} ideas vagas</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5 cursor-pointer flex-1">
                    <CardContent className="p-4 flex justify-between gap-4 items-center !flex-row group h-full">
                        <div className="flex-1 text-right">
                            <h4 className="font-bold text-sm text-emerald-500">Completadas</h4>
                            <p className="text-xs text-emerald-500/80 uppercase tracking-wide">¡{completadas.length} Logros!</p>
                        </div>
                        <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500 shadow-lg shadow-emerald-500/10">
                            <Trophy className="h-6 w-6 transition-transform group-hover:scale-110" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">

                {/* EXPLORADOR DE METAS ACTIVAS */}
                <div className="flex flex-col gap-6 md:col-span-8 lg:col-span-8">
                    <Card className="glass flex-1 flex flex-col border-border/50 min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-muted/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="h-5 w-5 text-foreground/80" />
                                    Objetivos en Progreso
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-4 bg-muted/5 min-h-[400px]">
                                {activos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-40 h-[300px]">
                                        <TrendingUp className="h-16 w-16 mb-4" />
                                        <p className="text-sm">No tienes metas en curso actualmente.</p>
                                    </div>
                                ) : (
                                    activos.map((met) => <MetaItem key={met.id} meta={met} milestones={met.goal_milestones || []} />)
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* METAS COMPLETAS y MILESTONES FASE 3 */}
                <div className="flex flex-col gap-6 md:col-span-4 lg:col-span-4">
                    <Card className="glass flex-1 flex flex-col border-emerald-500/10 bg-emerald-500/5 min-h-[200px]">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="text-sm flex gap-2 items-center uppercase tracking-widest text-emerald-500">
                                Salón de la Fama
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-sm flex-1">
                            {completadas.length === 0 ? (
                                <div className="text-center text-muted-foreground opacity-50 mt-10">
                                    Los objetivos al 100% se moverán aquí.
                                </div>
                            ) : (
                                <div className="space-y-4 py-2">
                                    {completadas.map(meta => {
                                        return (
                                            <div key={'comp_' + meta.id} className="border-l-4 pl-3 py-1 flex flex-col gap-1 border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors p-2 rounded-lg">
                                                <span className={`text-sm font-bold text-foreground`}>{meta.title}</span>
                                                <span className="text-[10px] text-emerald-500/70 font-mono uppercase">100% COMPLETADO</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* RESUMEN DE HITOS */}
                    {(() => {
                        const allMilestones = list.flatMap((g: any) => g.goal_milestones || [])
                        const totalMs = allMilestones.length
                        const doneMs = allMilestones.filter((m: any) => m.is_done).length
                        const pct = totalMs > 0 ? Math.round((doneMs / totalMs) * 100) : 0
                        return (
                            <Card className="glass flex flex-col gap-4 border-border/50 p-5">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Flag className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold">Resumen de Hitos</h4>
                                        <p className="text-xs text-muted-foreground">Progreso global de sub-tareas</p>
                                    </div>
                                </div>
                                {totalMs === 0 ? (
                                    <p className="text-xs text-muted-foreground/60 italic">
                                        Abre una meta y agregá hitos (sub-tareas) para desglosar tus objetivos.
                                    </p>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">{doneMs} de {totalMs} completados</span>
                                            <span className="font-bold font-mono text-primary">{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {allMilestones.filter((m: any) => !m.is_done).slice(0, 5).map((m: any) => (
                                                <div key={m.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                                                    <span className="truncate">{m.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </Card>
                        )
                    })()}
                </div>

            </div>
        </div>
    )
}
