import { createClient } from '@/lib/supabase/server'
import { AhorroForm } from '@/components/finanzas/ahorro-form'
import { AhorroItem } from '@/components/finanzas/ahorro-item'
import { formatCurrency } from '@/lib/utils/formatters'
import { PiggyBank, TrendingUp, Target, Banknote, Building2, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default async function AhorrosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: goalsRaw } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const goals = (goalsRaw || []) as any[]

    // Global stats
    const totalSaved = goals.reduce((acc, g) => acc + (Number(g.current_amount) || 0), 0)
    const totalTarget = goals.reduce((acc, g) => acc + (Number(g.goal_amount) || 0), 0)
    const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
    const achieved = goals.filter(g => Number(g.current_amount) >= Number(g.goal_amount)).length

    // Group by location type (first segment before " — ")
    const locationGroups: Record<string, number> = {}
    for (const g of goals) {
        const loc = (g.location || 'Efectivo').split('—')[0].trim()
        locationGroups[loc] = (locationGroups[loc] || 0) + (Number(g.current_amount) || 0)
    }

    const locationIcons: Record<string, any> = {
        'Efectivo': { icon: Banknote, color: 'text-emerald-500 bg-emerald-500/10' },
        'Cuenta Bancaria': { icon: Building2, color: 'text-blue-500 bg-blue-500/10' },
        'Caja de Ahorro': { icon: PiggyBank, color: 'text-violet-500 bg-violet-500/10' },
        'Billetera Virtual': { icon: Wallet, color: 'text-sky-500 bg-sky-500/10' },
        'Plazo Fijo': { icon: Building2, color: 'text-amber-500 bg-amber-500/10' },
        'Inversión': { icon: TrendingUp, color: 'text-orange-500 bg-orange-500/10' },
    }

    // Separate achieved vs in-progress
    const inProgress = goals.filter(g => Number(g.current_amount) < Number(g.goal_amount))
    const completed = goals.filter(g => Number(g.current_amount) >= Number(g.goal_amount))

    return (
        <div className="space-y-6 animate-fade-in mx-auto max-w-6xl pt-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ahorros & Objetivos</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Seguimento de tus metas financieras por destino: effectivo, bancos, wallets digitales y más.
                    </p>
                </div>
                <AhorroForm />
            </div>

            {/* Global Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <Card className="glass p-6 border-l-4 border-l-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
                    <PiggyBank className="absolute -right-4 -bottom-4 h-20 w-20 opacity-5" />
                    <p className="text-xs text-emerald-500/80 mb-1 font-semibold tracking-widest uppercase">Total Ahorrado</p>
                    <p className="text-3xl font-black text-emerald-500">{formatCurrency(totalSaved)}</p>
                    <div className="mt-2 w-full bg-muted/40 rounded-full h-1.5">
                        <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${totalProgress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{totalProgress.toFixed(1)}% de la meta total</p>
                </Card>

                <Card className="glass p-6 border-l-4 border-l-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
                    <p className="text-xs text-primary/80 mb-1 font-semibold tracking-widest uppercase flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Meta Global</p>
                    <p className="text-3xl font-black">{formatCurrency(totalTarget)}</p>
                    <p className="text-xs text-muted-foreground mt-2">{goals.length} objetivo{goals.length !== 1 ? 's' : ''} definido{goals.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs font-semibold text-emerald-500 mt-1">{achieved} logrado{achieved !== 1 ? 's' : ''} ✓</p>
                </Card>

                <Card className="glass p-6 border-l-4 border-l-muted-foreground/20 bg-gradient-to-br from-muted/10 to-transparent flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold tracking-widest uppercase">Distribución por Ubicación</p>
                    {Object.entries(locationGroups).length === 0 ? (
                        <p className="text-xs text-muted-foreground opacity-50 mt-2">Sin datos aún</p>
                    ) : (
                        Object.entries(locationGroups).map(([loc, amount]) => {
                            const cfg = locationIcons[loc] || locationIcons['Efectivo']
                            const IconCmp = cfg.icon
                            return (
                                <div key={loc} className="flex items-center justify-between text-xs gap-2">
                                    <span className={`flex items-center gap-1.5 font-medium ${cfg.color.split(' ')[0]}`}>
                                        <IconCmp className="h-3.5 w-3.5" /> {loc}
                                    </span>
                                    <span className="font-bold tabular-nums">{formatCurrency(amount)}</span>
                                </div>
                            )
                        })
                    )}
                </Card>
            </div>

            {/* In Progress Goals */}
            {inProgress.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" /> En Progreso ({inProgress.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {inProgress.map(g => <AhorroItem key={g.id} goal={g} />)}
                    </div>
                </div>
            )}

            {/* Completed Goals */}
            {completed.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                        ✓ Objetivos Cumplidos ({completed.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-80">
                        {completed.map(g => <AhorroItem key={g.id} goal={g} />)}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {goals.length === 0 && (
                <div className="flex flex-col items-center justify-center p-16 text-center opacity-50 bg-muted/5 rounded-2xl border border-dashed border-primary/20 h-[360px] mt-8">
                    <PiggyBank className="h-16 w-16 text-primary/40 mb-4" />
                    <p className="text-lg font-bold text-foreground/70 max-w-[280px]">
                        Todavía no definiste ningún objetivo de ahorro.
                    </p>
                    <p className="text-sm text-muted-foreground max-w-[300px] mt-2 leading-relaxed">
                        Creá tu primer objetivo: puede ser en efectivo, una cuenta bancaria, billetera virtual o plazo fijo.
                    </p>
                </div>
            )}
        </div>
    )
}
