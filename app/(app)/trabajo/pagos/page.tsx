import { createClient } from '@/lib/supabase/server'
import { TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { PayableForm } from '@/components/trabajo/payable-form'
import { PayableItem } from '@/components/trabajo/payable-item'

export default async function PagosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [{ data: payData }, { data: projectsData }] = await Promise.all([
        supabase.from('work_payables').select('*, work_projects(name, color)').eq('user_id', user.id).order('due_date', { ascending: true }),
        supabase.from('work_projects').select('id, name').eq('user_id', user.id).eq('status', 'active'),
    ])

    const items = (payData || []) as any[]
    const projects = (projectsData || []) as any[]

    const pending = items.filter(p => p.status === 'pending')
    const paid = items.filter(p => p.status === 'paid')
    const totalPending = pending.reduce((s, p) => s + Number(p.amount || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <TrendingDown className="h-7 w-7 text-rose-400" /> Pagos Pendientes
                    </h1>
                    <p className="text-muted-foreground mt-1">{pending.length} pagos · {formatCurrency(totalPending)} total</p>
                </div>
                <PayableForm projects={projects} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-5 border border-rose-500/20 bg-rose-500/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Por Pagar</p>
                    <p className="text-3xl font-black text-rose-400">{formatCurrency(totalPending)}</p>
                    <p className="text-xs text-muted-foreground">{pending.length} pendientes</p>
                </div>
                <div className="glass rounded-xl p-5 border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Pagado Total</p>
                    <p className="text-3xl font-black text-muted-foreground">
                        {formatCurrency(paid.reduce((s, p) => s + Number(p.amount || 0), 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">{paid.length} pagados</p>
                </div>
            </div>

            {pending.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pendientes</h2>
                    <div className="space-y-3">
                        {pending.map(p => <PayableItem key={p.id} item={p} />)}
                    </div>
                </div>
            )}

            {paid.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pagados</h2>
                    <div className="space-y-3 opacity-60">
                        {paid.slice(0, 5).map(p => <PayableItem key={p.id} item={p} />)}
                    </div>
                </div>
            )}

            {items.length === 0 && (
                <div className="glass rounded-xl p-16 text-center border border-dashed border-border/50">
                    <TrendingDown className="h-12 w-12 mx-auto text-rose-400 opacity-30 mb-4" />
                    <p className="text-muted-foreground">No hay pagos registrados aún.</p>
                </div>
            )}
        </div>
    )
}
