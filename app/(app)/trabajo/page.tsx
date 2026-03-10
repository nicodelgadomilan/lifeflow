import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, FolderKanban, CheckSquare, Users, TrendingUp, TrendingDown, Receipt, CalendarClock, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import Link from 'next/link'

export default async function TrabajoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [
        { data: projects },
        { data: tasks },
        { data: meetings },
        { data: receivables },
        { data: payables },
        { data: taxes }
    ] = await Promise.all([
        supabase.from('work_projects').select('*').eq('user_id', user.id),
        supabase.from('work_tasks').select('*').eq('user_id', user.id).neq('status', 'done'),
        supabase.from('work_meetings').select('*').eq('user_id', user.id).eq('status', 'scheduled').order('meeting_date', { ascending: true }).limit(5),
        supabase.from('work_receivables').select('*').eq('user_id', user.id).eq('status', 'pending'),
        supabase.from('work_payables').select('*').eq('user_id', user.id).eq('status', 'pending'),
        supabase.from('work_taxes').select('*').eq('user_id', user.id).eq('status', 'pending').order('due_date', { ascending: true }),
    ])

    const proj = (projects || []) as any[]
    const pend = (tasks || []) as any[]
    const meet = (meetings || []) as any[]
    const recv = (receivables || []) as any[]
    const pay = (payables || []) as any[]
    const tax = (taxes || []) as any[]

    const totalReceivable = recv.reduce((s, r) => s + Number(r.amount || 0), 0)
    const totalPayable = pay.reduce((s, p) => s + Number(p.amount || 0), 0)
    const totalTax = tax.reduce((s, t) => s + Number(t.amount || 0), 0)
    const activeProjects = proj.filter(p => p.status === 'active').length

    const quickLinks = [
        { href: '/trabajo/proyectos', label: 'Proyectos', icon: FolderKanban, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', count: activeProjects, desc: 'activos' },
        { href: '/trabajo/tareas', label: 'Tareas', icon: CheckSquare, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', count: pend.length, desc: 'pendientes' },
        { href: '/trabajo/reuniones', label: 'Reuniones', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', count: meet.length, desc: 'próximas' },
        { href: '/trabajo/cobros', label: 'Cobros', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', count: recv.length, desc: 'por cobrar' },
        { href: '/trabajo/pagos', label: 'Pagos', icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', count: pay.length, desc: 'por pagar' },
        { href: '/trabajo/tributacion', label: 'Tributación', icon: Receipt, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', count: tax.length, desc: 'vencimientos' },
    ]

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pt-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Briefcase className="h-8 w-8 text-indigo-400" />
                    Trabajo
                </h1>
                <p className="text-muted-foreground mt-1">Centro de comando profesional</p>
            </div>

            {/* KPIs financieros de trabajo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="glass border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Por Cobrar</p>
                            <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalReceivable)}</p>
                            <p className="text-xs text-muted-foreground">{recv.length} facturas pendientes</p>
                        </div>
                        <div className="bg-emerald-500/20 p-3 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass border-rose-500/20 bg-rose-500/5">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Por Pagar</p>
                            <p className="text-2xl font-black text-rose-400">{formatCurrency(totalPayable)}</p>
                            <p className="text-xs text-muted-foreground">{pay.length} pagos pendientes</p>
                        </div>
                        <div className="bg-rose-500/20 p-3 rounded-xl">
                            <TrendingDown className="h-6 w-6 text-rose-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass border-amber-500/20 bg-amber-500/5">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Impuestos</p>
                            <p className="text-2xl font-black text-amber-400">{formatCurrency(totalTax)}</p>
                            <p className="text-xs text-muted-foreground">{tax.length} vencimientos</p>
                        </div>
                        <div className="bg-amber-500/20 p-3 rounded-xl">
                            <Receipt className="h-6 w-6 text-amber-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Links rápidos a secciones */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickLinks.map(link => (
                    <Link key={link.href} href={link.href}>
                        <Card className={`glass card-hover border h-full ${link.bg}`}>
                            <CardContent className="p-5 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-xl ${link.bg}`}>
                                        <link.icon className={`h-5 w-5 ${link.color}`} />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">{link.label}</p>
                                    <p className={`text-2xl font-black ${link.color}`}>{link.count}</p>
                                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Próximas reuniones */}
            {meet.length > 0 && (
                <Card className="glass border-violet-500/20">
                    <CardHeader className="border-b border-border/50 pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-violet-400" />
                            Próximas Reuniones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {meet.map((m: any) => (
                            <div key={m.id} className="flex items-center gap-4 p-4 border-b border-border/30 last:border-0 hover:bg-muted/5">
                                <div className="bg-violet-500/10 p-2 rounded-lg text-center min-w-[48px]">
                                    <p className="text-xs text-violet-400 font-bold">
                                        {new Date(m.meeting_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{m.title}</p>
                                    <p className="text-xs text-muted-foreground">{m.with_whom} · {m.type}</p>
                                </div>
                                {m.meeting_time && (
                                    <span className="text-xs text-violet-400 font-mono">{m.meeting_time.substring(0, 5)}</span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
