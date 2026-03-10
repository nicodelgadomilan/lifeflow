import { createClient } from '@/lib/supabase/server'
import { ActivoForm } from '@/components/finanzas/activo-form'
import { ActivoItem } from '@/components/finanzas/activo-item'
import { Card } from '@/components/ui/card'
import {
    TrendingUp, TrendingDown, BarChart3, FileBarChart,
    Bitcoin, Home, Package, Car, Briefcase
} from 'lucide-react'

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    'Acciones': { icon: BarChart3, color: 'text-blue-500', label: 'Acciones' },
    'Bonos': { icon: FileBarChart, color: 'text-violet-500', label: 'Bonos' },
    'FCI': { icon: TrendingUp, color: 'text-emerald-500', label: 'FCI / Fondos' },
    'Cripto': { icon: Bitcoin, color: 'text-orange-500', label: 'Cripto' },
    'Inmueble': { icon: Home, color: 'text-amber-500', label: 'Inmueble' },
    'Físico': { icon: Package, color: 'text-yellow-500', label: 'Físico' },
    'Vehículo': { icon: Car, color: 'text-sky-500', label: 'Vehículo' },
    'Otro': { icon: Briefcase, color: 'text-muted-foreground', label: 'Otro' },
}

export default async function ActivosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: assetsRaw } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const assets = (assetsRaw || []) as any[]

    // Global stats
    const totalInvested = assets.reduce((a, x) => a + (Number(x.invested_amount) || 0), 0)
    const totalCurrent = assets.reduce((a, x) => a + (Number(x.current_value) || Number(x.invested_amount) || 0), 0)
    const totalGain = totalCurrent - totalInvested
    const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
    const isUp = totalGain >= 0

    function fmt(n: number) {
        return `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    // Group by type for the breakdown card
    const byType: Record<string, { invested: number; current: number; count: number }> = {}
    for (const a of assets) {
        const t = a.type || 'Otro'
        if (!byType[t]) byType[t] = { invested: 0, current: 0, count: 0 }
        byType[t].invested += Number(a.invested_amount) || 0
        byType[t].current += Number(a.current_value) || Number(a.invested_amount) || 0
        byType[t].count++
    }

    // Split into groups
    const FINANCIAL = ['Acciones', 'Bonos', 'FCI', 'Cripto']
    const TANGIBLE = ['Inmueble', 'Físico', 'Vehículo', 'Otro']

    const financials = assets.filter(a => FINANCIAL.includes(a.type))
    const tangibles = assets.filter(a => TANGIBLE.includes(a.type))

    return (
        <div className="space-y-6 animate-fade-in mx-auto max-w-6xl pt-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activos e Inversiones</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Tu portafolio completo: acciones, bonos, cripto, FCI, inmuebles y bienes tangibles.
                    </p>
                </div>
                <ActivoForm />
            </div>

            {/* Summary Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

                {/* Net Worth Snapshot */}
                <Card className="glass sm:col-span-1 p-6 border-l-4 border-l-primary/50 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
                    <TrendingUp className="absolute -right-4 -bottom-4 h-24 w-24 opacity-5" strokeWidth={1} />
                    <p className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-1">Patrimonio Total (Activos)</p>
                    <p className="text-3xl font-black">{fmt(totalCurrent)}</p>
                    <p className="text-xs text-muted-foreground mt-2">{assets.length} activo{assets.length !== 1 ? 's' : ''} registrado{assets.length !== 1 ? 's' : ''}</p>
                </Card>

                {/* Total Invested vs Gain */}
                <Card className={`glass p-6 border-l-4 ${isUp ? 'border-l-emerald-500/50 bg-gradient-to-br from-emerald-500/5' : 'border-l-rose-500/50 bg-gradient-to-br from-rose-500/5'} to-transparent`}>
                    <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">Rentabilidad Neta</p>
                    <div className="flex items-center gap-2">
                        {isUp ? <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" /> : <TrendingDown className="h-5 w-5 text-rose-500 shrink-0" />}
                        <p className={`text-3xl font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isUp ? '+' : ''}{gainPct.toFixed(2)}%
                        </p>
                    </div>
                    <p className={`text-sm font-semibold mt-1 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isUp ? '+' : ''}{fmt(totalGain)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Capital invertido: {fmt(totalInvested)}</p>
                </Card>

                {/* Breakdown by type */}
                <Card className="glass p-5 border-border/40 flex flex-col gap-2 overflow-y-auto max-h-[200px]">
                    <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">Distribución del Portafolio</p>
                    {Object.entries(byType).length === 0 ? (
                        <p className="text-xs text-muted-foreground opacity-50 mt-2">Sin datos aún</p>
                    ) : (
                        Object.entries(byType).map(([type, data]) => {
                            const cfg = TYPE_CONFIG[type] || TYPE_CONFIG['Otro']
                            const Icon = cfg.icon
                            const pct = totalCurrent > 0 ? (data.current / totalCurrent) * 100 : 0
                            return (
                                <div key={type} className="flex items-center gap-2">
                                    <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.color}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium truncate">{cfg.label}</span>
                                            <span className="text-muted-foreground shrink-0 ml-1">{pct.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-muted/40 rounded-full h-1 mt-1">
                                            <div className={`h-1 rounded-full ${cfg.color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </Card>
            </div>

            {/* Financial Assets */}
            {financials.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" /> Instrumentos Financieros
                        <span className="text-muted-foreground/50 font-normal normal-case text-xs">(Acciones · Bonos · Cripto · FCI)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {financials.map(a => <ActivoItem key={a.id} asset={a} />)}
                    </div>
                </div>
            )}

            {/* Tangible Assets */}
            {tangibles.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Home className="h-4 w-4 text-amber-500" /> Activos Reales & Físicos
                        <span className="text-muted-foreground/50 font-normal normal-case text-xs">(Inmuebles · Vehículos · Oro · Bienes)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {tangibles.map(a => <ActivoItem key={a.id} asset={a} />)}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {assets.length === 0 && (
                <div className="flex flex-col items-center justify-center p-16 text-center opacity-50 bg-muted/5 rounded-2xl border border-dashed border-primary/20 h-[360px] mt-8">
                    <TrendingUp className="h-16 w-16 text-primary/40 mb-4" />
                    <p className="text-lg font-bold text-foreground/70 max-w-[300px]">
                        Tu portafolio está vacío.
                    </p>
                    <p className="text-sm text-muted-foreground max-w-[320px] mt-2 leading-relaxed">
                        Agregá tus primeros activos: acciones, bonos, cripto, fondos de inversión, inmuebles o bienes físicos.
                    </p>
                </div>
            )}
        </div>
    )
}
