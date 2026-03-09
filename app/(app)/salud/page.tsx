import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HeartPulse, Droplet, Stethoscope, ArrowRight, Dna } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SaludResumenPage() {
    const supabase = await createClient()

    // Resumen de citas proximas
    const { data: appts } = await supabase
        .from('health_appointments')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })

    const appointments = (appts || []) as any[]

    // Resumen de Habitos activos
    const { data: habitsCount } = await supabase
        .from('habits')
        .select('id', { count: 'exact' })

    const totalHabits = habitsCount?.length || 0

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Centro de Salud</h1>
                    <p className="text-muted-foreground mt-1">
                        Tu expediente personal de bienestar general.
                    </p>
                </div>
            </div>

            {/* Quick Links / Navigation Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/salud/citas">
                    <Card className="glass card-hover border-rose-500/20 bg-rose-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-rose-500 group-hover:underline">
                                Citas Médicas
                            </CardTitle>
                            <Stethoscope className="h-6 w-6 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-500">{appointments.length}</div>
                            <p className="text-xs text-rose-500/70 mt-1">Turnos programados próximos</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/salud/habitos">
                    <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-emerald-500 group-hover:underline">
                                Hábitos
                            </CardTitle>
                            <Droplet className="h-6 w-6 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">{totalHabits} rutinas</div>
                            <p className="text-xs text-emerald-500/70 mt-1">Hábitos de bienestar diario</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/salud/metricas">
                    <Card className="glass card-hover border-sky-500/20 bg-sky-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-sky-500 group-hover:underline">
                                Mis Métricas
                            </CardTitle>
                            <Dna className="h-6 w-6 text-sky-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-sky-500 flex items-center gap-2">
                                Dashboard <ArrowRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1" />
                            </div>
                            <p className="text-xs text-sky-500/70 mt-1">Peso, sueño y signos vitales</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* WIDGET Próximas Citas */}
                <Card className="glass border-rose-500/10">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Stethoscope className="h-5 w-5 text-rose-500" /> Alertas Médicas
                        </CardTitle>
                        <CardDescription>Próxima visita tu doctor principal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {appointments.length > 0 ? (
                            <div className="p-4 border border-rose-500/30 rounded-lg bg-rose-500/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-rose-500">{appointments[0].type}</span>
                                    <span className="text-sm font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">{new Date(appointments[0].date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-foreground/80">Con: {appointments[0].doctor}</p>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-muted-foreground bg-muted/5 rounded-lg border border-dashed text-sm">
                                No tenés citas agendadas por el momento.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* PROGRESO ESTADISTICO WIDGET FASCIA 3 */}
                <Card className="glass border-border/50 opacity-70">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                            <HeartPulse className="h-5 w-5" /> Integración con Wearables
                        </CardTitle>
                        <CardDescription>Métricas automatizadas (Fase 3)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 border-t border-border/20">
                        <p className="text-sm text-center">Aquí se habilitarán conexiones a Apple Health / Google Fit para sincronizar la presión arterial o ritmo cardíaco en el futuro.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
