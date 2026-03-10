import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Plus, Clock, CheckCircle2, PauseCircle, XCircle, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { ProyectoForm } from '@/components/trabajo/proyecto-form'
import { ProyectoActions } from '@/components/trabajo/proyecto-actions'
import { Badge } from '@/components/ui/badge'

const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
    active: { label: 'Activo', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
    paused: { label: 'Pausado', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: PauseCircle },
    completed: { label: 'Completado', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', icon: XCircle },
}

const PRIORITY_MAP: Record<string, string> = {
    low: 'text-muted-foreground',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
}

export default async function ProyectosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase.from('work_projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const projects = (data || []) as any[]

    const active = projects.filter(p => p.status === 'active').length
    const completed = projects.filter(p => p.status === 'completed').length
    const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FolderKanban className="h-7 w-7 text-indigo-400" /> Proyectos
                    </h1>
                    <p className="text-muted-foreground mt-1">{active} activos · {completed} completados</p>
                </div>
                <ProyectoForm />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-4 border border-indigo-500/20 text-center">
                    <p className="text-2xl font-black text-indigo-400">{active}</p>
                    <p className="text-xs text-muted-foreground">Activos</p>
                </div>
                <div className="glass rounded-xl p-4 border border-blue-500/20 text-center">
                    <p className="text-2xl font-black text-blue-400">{completed}</p>
                    <p className="text-xs text-muted-foreground">Completados</p>
                </div>
                <div className="glass rounded-xl p-4 border border-emerald-500/20 text-center">
                    <p className="text-lg font-black text-emerald-400">{formatCurrency(totalBudget)}</p>
                    <p className="text-xs text-muted-foreground">Presupuesto total</p>
                </div>
            </div>

            {/* Listado */}
            {projects.length === 0 ? (
                <div className="glass rounded-xl p-16 text-center border border-dashed border-border/50">
                    <FolderKanban className="h-12 w-12 mx-auto text-indigo-400 opacity-30 mb-4" />
                    <p className="text-muted-foreground">No hay proyectos. Creá el primero.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {projects.map((p: any) => {
                        const st = STATUS_MAP[p.status] || STATUS_MAP.active
                        const StIcon = st.icon
                        const prColor = PRIORITY_MAP[p.priority] || 'text-muted-foreground'
                        const daysLeft = p.deadline
                            ? Math.ceil((new Date(p.deadline).getTime() - Date.now()) / 86400000)
                            : null

                        return (
                            <Card key={p.id} className="glass border-border/40 hover:bg-muted/5 transition-all group">
                                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Color indicador */}
                                    <div className="w-1.5 h-12 rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: p.color || '#6366f1' }} />

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-bold text-lg">{p.name}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${st.color}`}>
                                                {st.label}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase ${prColor}`}>
                                                ● {p.priority}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            {p.client && <span>👤 {p.client}</span>}
                                            {p.budget && <span>💰 {formatCurrency(p.budget)}</span>}
                                            {p.deadline && (
                                                <span className={daysLeft !== null && daysLeft < 7 ? 'text-rose-400 font-bold' : ''}>
                                                    {daysLeft !== null && daysLeft < 0
                                                        ? `⚠️ Vencido hace ${Math.abs(daysLeft)}d`
                                                        : `📅 ${daysLeft}d restantes`
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        {p.notes && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">{p.notes}</p>}
                                    </div>

                                    <ProyectoActions project={p} />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
