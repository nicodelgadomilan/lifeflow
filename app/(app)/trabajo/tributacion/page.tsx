import { createClient } from '@/lib/supabase/server'
import { Receipt, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { TaxForm } from '@/components/trabajo/tax-form'
import { TaxItem } from '@/components/trabajo/tax-item'

const CATEGORY_LABELS: Record<string, string> = {
    national: '🇦🇷 Nacional',
    provincial: '🏛️ Provincial',
    municipal: '🏙️ Municipal',
}

export default async function TributacionPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase.from('work_taxes').select('*').eq('user_id', user.id).order('due_date', { ascending: true })
    const taxes = (data || []) as any[]

    const pending = taxes.filter(t => t.status === 'pending')
    const paid = taxes.filter(t => t.status === 'paid')
    const overdue = taxes.filter(t => t.status === 'overdue' || (t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date()))
    const totalPending = pending.reduce((s, t) => s + Number(t.amount || 0), 0)

    // Agrupado por categoría
    const byCategory: Record<string, any[]> = { national: [], provincial: [], municipal: [] }
    for (const t of pending) {
        if (byCategory[t.category]) byCategory[t.category].push(t)
        else byCategory['national'].push(t)
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Receipt className="h-7 w-7 text-amber-400" /> Tributación
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {pending.length} vencimientos pendientes
                        {overdue.length > 0 && <span className="text-rose-400 font-bold"> · {overdue.length} vencidos</span>}
                    </p>
                </div>
                <TaxForm />
            </div>

            {/* Totales */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-4 border border-amber-500/20 bg-amber-500/5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Por Pagar</p>
                    <p className="text-xl font-black text-amber-400">{formatCurrency(totalPending)}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-rose-500/20 bg-rose-500/5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Vencidos</p>
                    <p className="text-xl font-black text-rose-400">{overdue.length}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Pagados</p>
                    <p className="text-xl font-black text-emerald-400">{paid.length}</p>
                </div>
            </div>

            {/* Pendientes por categoría */}
            {Object.entries(byCategory).map(([cat, items]) => items.length > 0 && (
                <div key={cat}>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                        {CATEGORY_LABELS[cat] || cat}
                    </h2>
                    <div className="space-y-3">
                        {items.map(t => <TaxItem key={t.id} item={t} />)}
                    </div>
                </div>
            ))}

            {/* Pagados */}
            {paid.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pagados</h2>
                    <div className="space-y-3 opacity-50">
                        {paid.slice(0, 6).map(t => <TaxItem key={t.id} item={t} />)}
                    </div>
                </div>
            )}

            {taxes.length === 0 && (
                <div className="glass rounded-xl p-16 text-center border border-dashed border-border/50">
                    <Receipt className="h-12 w-12 mx-auto text-amber-400 opacity-30 mb-4" />
                    <p className="text-muted-foreground">Registrá tus impuestos y vencimientos tributarios.</p>
                </div>
            )}
        </div>
    )
}
