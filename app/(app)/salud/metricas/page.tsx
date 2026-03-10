import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Dna, TrendingUp, Scale, Brain } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MetricasForm } from '@/components/salud/metricas-form'
import { MetricLineChart } from '@/components/salud/metric-line-chart'
import { PhysicalProfileCard } from '@/components/salud/physical-profile'
export default async function MetricasPage() {
    const supabase = await createClient()

    const { data: metrics } = await supabase
        .from('health_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(60) // enough history for charts

    const allMetrics = (metrics || []) as any[]

    const getLatest = (type: string) => allMetrics.find(m => m.type === type)
    const getHistory = (type: string) => allMetrics.filter(m => m.type === type)

    const latestWeight = getLatest('Peso')
    const latestHeight = getLatest('Altura')
    const latestPressure = getLatest('Presion')
    const latestWater = getLatest('Agua')
    const latestSleep = getLatest('Sueno')
    const latestPhysicalProfile = getLatest('PerfilFisico')

    const weightHistory = getHistory('Peso')

    const currentHeightStr = latestPhysicalProfile?.value || latestHeight?.value
    const currentHeight = currentHeightStr ? Number(currentHeightStr) : null
    const currentGender = latestPhysicalProfile?.unit || null

    const visibleMetrics = allMetrics.filter(m => m.type !== 'PerfilFisico')

    // IMC automático
    let imc: number | null = null
    let imcLabel = ''
    let imcColor = ''
    if (latestWeight && currentHeight) {
        const h = currentHeight / 100 // cm to m
        imc = Number(latestWeight.value) / (h * h)
        if (imc < 18.5) { imcLabel = 'Bajo peso'; imcColor = 'text-sky-500' }
        else if (imc < 25) { imcLabel = 'Normal ✓'; imcColor = 'text-emerald-500' }
        else if (imc < 30) { imcLabel = 'Sobrepeso'; imcColor = 'text-amber-500' }
        else { imcLabel = 'Obesidad'; imcColor = 'text-destructive' }
    }

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

            <PhysicalProfileCard currentHeight={currentHeight || undefined} currentGender={currentGender || undefined} />

            {/* Quick Summary Widgets */}
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
                <Card className="glass card-hover border-sky-500/20 bg-sky-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-500">Peso</CardTitle>
                        <Scale className="h-4 w-4 text-sky-500 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-500">
                            {latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : '--'}
                        </div>
                        {weightHistory.length > 1 && (() => {
                            const prev = weightHistory[1]
                            const diff = Number(latestWeight.value) - Number(prev.value)
                            return <p className={`text-xs mt-1 ${diff < 0 ? 'text-emerald-500' : diff > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg vs anterior
                            </p>
                        })()}
                    </CardContent>
                </Card>

                {/* IMC automático */}
                <Card className={`glass card-hover ${imc ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/20'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">IMC</CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${imcColor || 'text-muted-foreground'}`}>
                            {imc ? imc.toFixed(1) : '--'}
                        </div>
                        <p className={`text-xs mt-1 font-medium ${imcColor || 'text-muted-foreground'}`}>
                            {imcLabel || (latestWeight && !currentHeight ? 'Falta altura' : 'Sin datos')}
                        </p>
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* HISTORIAL TABLA */}
                <div className="flex flex-col gap-6 md:col-span-7">
                    <Card className="glass flex-1 flex flex-col border-sky-500/10 min-h-[400px]">
                        <CardHeader className="border-b border-border/50 bg-sky-500/5 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Dna className="h-5 w-5 text-sky-500" />
                                Historial de Cargas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-3">
                                {visibleMetrics.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-[300px]">
                                        <Activity className="h-12 w-12 text-sky-500 mb-4 opacity-50" />
                                        <p className="text-sm">Aún no registraste ninguna medida corporal.</p>
                                    </div>
                                ) : (
                                    visibleMetrics.map((met) => (
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

                {/* GRÁFICO EVOLUCIÓN PESO + IMC */}
                <div className="flex flex-col gap-6 md:col-span-5">
                    <Card className="glass flex flex-col border-sky-500/10 p-5">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-sky-500" />
                                Evolución del Peso
                            </CardTitle>
                            <CardDescription>Histórico de todos tus registros</CardDescription>
                        </CardHeader>
                        <MetricLineChart metrics={weightHistory} type="Peso" color="#0ea5e9" />
                    </Card>

                    {/* IMC Card informativo */}
                    {imc && (
                        <Card className={`glass p-5 border-l-4 ${imc < 18.5 ? 'border-l-sky-500' : imc < 25 ? 'border-l-emerald-500' : imc < 30 ? 'border-l-amber-500' : 'border-l-destructive'}`}>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Índice de Masa Corporal</p>
                            <div className="flex items-end gap-3">
                                <span className={`text-4xl font-black ${imcColor}`}>{imc.toFixed(1)}</span>
                                <span className={`text-sm font-semibold mb-1 ${imcColor}`}>{imcLabel}</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-muted/40 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${imc < 18.5 ? 'bg-sky-500' : imc < 25 ? 'bg-emerald-500' : imc < 30 ? 'bg-amber-500' : 'bg-destructive'}`}
                                    style={{ width: `${Math.min(100, (imc / 40) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                <span>Bajo (18.5)</span><span>Normal (25)</span><span>Obeso (30+)</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                Peso: {latestWeight.value} kg · Altura: {currentHeight} cm
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
