import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Dna, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MetricasForm } from '@/components/salud/metricas-form'

export default async function MetricasPage() {
    const supabase = await createClient()

    const { data: metrics } = await supabase
        .from('health_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(20)

    const allMetrics = (metrics || []) as any[]

    const getLatest = (type: string) => allMetrics.find(m => m.type === type)

    const latestWeight = getLatest('Peso')
    const latestPressure = getLatest('Presion')
    const latestWater = getLatest('Agua')
    const latestSleep = getLatest('Sueno')

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Registro de Métricas</h1>
                    <p className="text-muted-foreground mt-1">
                        Control general de tus valores corporales.
                    </p>
                </div>
                <MetricasForm />
            </div>

            {/* Quick Summary Widgets */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="glass card-hover border-sky-500/20 bg-sky-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-500">Peso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-500">
                            {latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : '--'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-rose-500/20 bg-rose-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rose-500">Presión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-500">
                            {latestPressure ? `${latestPressure.value} ${latestPressure.unit}` : '--'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-blue-500/20 bg-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-500">Agua</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {latestWater ? `${latestWater.value} ${latestWater.unit}` : '--'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-indigo-500/20 bg-indigo-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-500">Sueño</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-500">
                            {latestSleep ? `${latestSleep.value} ${latestSleep.unit}` : '--'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">

                {/* HISTORIAL TABLA */}
                <div className="flex flex-col gap-6 md:col-span-8">
                    <Card className="glass flex-1 flex flex-col border-sky-500/10 min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-sky-500/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Dna className="h-5 w-5 text-sky-500" />
                                    Historial de Cargas
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-3">
                                {allMetrics.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-[300px]">
                                        <Activity className="h-12 w-12 text-sky-500 mb-4 opacity-50" />
                                        <p className="text-sm">Aún no registraste ninguna medida corporal.</p>
                                    </div>
                                ) : (
                                    allMetrics.map((met) => (
                                        <div key={met.id} className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-sky-500/10 text-sky-500 font-bold rounded-lg flex items-center justify-center uppercase text-xs">
                                                    {met.type.substring(0, 3)}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{met.type}</h4>
                                                    <span className="text-xs text-muted-foreground">{new Date(met.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold font-mono">
                                                {met.value} <span className="text-sm text-sky-500 font-sans ml-1">{met.unit}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SIDEBAR ESPACIO RESERVADO GRAFICOS */}
                <div className="flex flex-col gap-6 md:col-span-4">
                    <Card className="glass flex-1 flex flex-col border-none min-h-[500px] items-center justify-center p-6 text-center">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
                        <p className="text-sm text-muted-foreground/80 max-w-[200px]">
                            Para la Fase 3, aquí se incluirá un panel interactivo con gráficas de evolución mensual de peso e IMC automatizadas con Recharts.
                        </p>
                    </Card>
                </div>

            </div>
        </div>
    )
}
