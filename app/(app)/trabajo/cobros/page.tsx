import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { ReceivableForm } from '@/components/trabajo/receivable-form'
import { ReceivableItem } from '@/components/trabajo/receivable-item'

export default async function CobrosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [{ data: recvData }, { data: projectsData }] = await Promise.all([
        supabase.from('work_receivables').select('*, work_projects(name, color)').eq('user_id', user.id).order('due_date', { ascending: true }),
        supabase.from('work_projects').select('id, name').eq('user_id', user.id).eq('status', 'active'),
    ])

    const items = (recvData || []) as any[]
    const projects = (projectsData || []) as any[]

    const pending = items.filter(r => r.status === 'pending' || r.status === 'partial')
    const paid = items.filter(r => r.status === 'paid')
    const overdue = items.filter(r => r.status === 'overdue' || (r.due_date && new Date(r.due_date) < new Date() && r.status === 'pending'))

    const totalPending = pending.reduce((s, r) => s + Number(r.amount || 0), 0)
    const totalPaid = paid.reduce((s, r) => s + Number(r.amount || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <TrendingUp className="h-7 w-7 text-emerald-400" /> Cobros Pendientes
                    </h1>
                    <p className="text-muted-foreground mt-1">{pending.length} facturas · {overdue.length > 0 ? `${overdue.length} vencidas` : 'Sin vencidos'}</p>
                </div>
                <ReceivableForm projects={projects} />
            </div>

            {/* Totales */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-5 border border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Por Cobrar</p>
                    <p className="text-3xl font-black text-emerald-400">{formatCurrency(totalPending)}</p>
                    <p className="text-xs text-muted-foreground">{pending.length} facturas</p>
                </div>
                <div className="glass rounded-xl p-5 border border-blue-500/20 bg-blue-500/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Cobrado Total</p>
                    <p className="text-3xl font-black text-blue-400">{formatCurrency(totalPaid)}</p>
                    <p className="text-xs text-muted-foreground">{paid.length} cobrados</p>
                </div>
            </div>

            {/* Pendientes */}
            {pending.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pendientes de Cobro</h2>
                    <div className="space-y-3">
                        {pending.map(r => <ReceivableItem key={r.id} item={r} />)}
                    </div>
                </div>
            )}

            {/* Cobrados */}
            {paid.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Cobrados</h2>
                    <div className="space-y-3 opacity-60">
                        {paid.slice(0, 5).map(r => <ReceivableItem key={r.id} item={r} />)}
                    </div>
                </div>
            )}

            {items.length === 0 && (
                <div className="glass rounded-xl p-16 text-center border border-dashed border-border/50">
                    <TrendingUp className="h-12 w-12 mx-auto text-emerald-400 opacity-30 mb-4" />
                    <p className="text-muted-foreground">No hay cobros registrados aún.</p>
                </div>
            )}
        </div>
    )
}
