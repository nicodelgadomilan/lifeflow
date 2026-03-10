import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CalendarClock, CheckSquare, TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { DashboardChart } from '@/components/finanzas/dashboard-chart'
import { HabitWidget } from '@/components/dashboard/habit-widget'
import { CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TransactionFormDialog } from '@/components/finanzas/transaction-form'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Nombre del usuario
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id ?? '')
        .single()

    const profileData = profile as { full_name?: string } | null
    const userName = profileData?.full_name?.split(' ')[0] || 'Bienvenido'

    // 1. Fetch Transacciones
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true })

    // 2. Fetch Suscripciones activas
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('next_date', { ascending: true })
        .limit(5)

    // 3. Fetch Hábitos
    const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true })
    const habits = (habitsData || []) as any[]

    // 4. Fetch Tareas pendientes
    const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, status')
        .neq('status', 'done')
    const pendingTasksCount = (tasksData || []).length

    const today = new Date()
    const in7Days = new Date()
    in7Days.setDate(today.getDate() + 7)
    const todayStr = today.toISOString().split('T')[0]
    const in7DaysStr = in7Days.toISOString().split('T')[0]

    const { data: upcomingServices } = await supabase
        .from('services')
        .select('id, name, amount, due_date, is_paid, category')
        .eq('is_paid', false)
        .gte('due_date', todayStr)
        .lte('due_date', in7DaysStr)
        .order('due_date', { ascending: true })
        .limit(4)

    const services = (upcomingServices || []) as any[]
    const tx = (transactions || []) as any[]
    const subs = (subscriptions || []) as any[]

    let totalIncome = 0
    let totalExpense = 0
    const groupedData: Record<string, { name: string; Ingresos: number; Egresos: number }> = {}

    for (const t of tx) {
        // Usar amount_ars si existe (multimoneda), sino amount
        const arsAmount = Number(t.amount_ars || t.amount)
        if (t.type === 'income') totalIncome += arsAmount
        if (t.type === 'expense') totalExpense += arsAmount

        const dateStr = t.date.substring(5, 10)
        if (!groupedData[dateStr]) groupedData[dateStr] = { name: dateStr, Ingresos: 0, Egresos: 0 }
        if (t.type === 'income') groupedData[dateStr].Ingresos += arsAmount
        if (t.type === 'expense') groupedData[dateStr].Egresos += arsAmount
    }

    const chartData = Object.values(groupedData).slice(-14)
    const balance = totalIncome - totalExpense
    const isBalancePositive = balance >= 0

    function daysUntil(dateStr: string) {
        const d = new Date(dateStr)
        return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
            {/* HEADER con saludo tipo App */}
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center rounded-full size-12 shadow-md bg-gradient-to-br from-primary to-indigo-600 text-white font-bold text-xl">
                    {userName.substring(0, 1).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">Hola, {userName}</h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                        {today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* ═══ TODAY'S FOCUS (Hábitos / Tareas del Día) ═══ */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 w-full">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarCheck className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-bold">Focus del Día</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Tus hábitos pendientes para mantener la racha semanal.
                        </p>
                    </div>
                </div>

                <div className="w-full z-10">
                    <HabitWidget habits={habits} />
                </div>
            </div>

            {/* ═══ BOTONES DE ACCIÓN RÁPIDA (Optimizados para Mobile) ═══ */}
            <div>
                <h3 className="text-lg font-bold px-1 mb-3">Acciones Rápidas</h3>
                <div className="grid grid-cols-3 gap-3">
                    <TransactionFormDialog
                        defaultType="income"
                        trigger={
                            <button className="glass p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-500/10 transition-colors border outline-none border-transparent hover:border-emerald-500/30 w-full group">
                                <div className="size-10 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-colors">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-foreground">Ingreso</span>
                            </button>
                        }
                    />
                    <TransactionFormDialog
                        defaultType="expense"
                        trigger={
                            <button className="glass p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-rose-500/10 transition-colors border outline-none border-transparent hover:border-rose-500/30 w-full group">
                                <div className="size-10 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors">
                                    <ArrowDownRight className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-foreground">Egreso</span>
                            </button>
                        }
                    />
                    <Link href="/organizacion/tareas" className="block outline-none w-full">
                        <button className="w-full bg-primary/90 hover:bg-primary p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(19,127,236,0.3)] border-transparent group">
                            <div className="size-10 rounded-full bg-white/20 text-white flex items-center justify-center transition-all group-hover:scale-110">
                                <CheckSquare className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-white">Nueva Tarea</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* ═══ QUICK STATS (Scrolleable Horizontal para Mobile) ═══ */}
            <div>
                <h3 className="text-lg font-bold px-1 mb-3">Estadísticas Rápidas</h3>
                <div className="flex overflow-x-auto gap-3 pb-4 px-1 snap-x scrollbar-hide -mx-1">

                    <div className="glass min-w-[150px] p-4 rounded-2xl snap-start flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Wallet className="h-5 w-5 text-emerald-500 mb-1" />
                        <p className="text-muted-foreground text-xs font-medium">Balance</p>
                        <p className="text-xl font-bold">{formatCurrency(balance)}</p>
                    </div>

                    <div className="glass min-w-[150px] p-4 rounded-2xl snap-start flex flex-col gap-2 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <TrendingDown className="h-5 w-5 text-rose-500 mb-1" />
                        <p className="text-muted-foreground text-xs font-medium">Gastos Mes</p>
                        <p className="text-xl font-bold">{formatCurrency(totalExpense)}</p>
                    </div>

                    <div className="glass min-w-[150px] p-4 rounded-2xl snap-start flex flex-col gap-2 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CalendarClock className="h-5 w-5 text-amber-500 mb-1" />
                        <p className="text-muted-foreground text-xs font-medium">Suscripciones</p>
                        <p className="text-xl font-bold">{subs.length} activas</p>
                    </div>

                    <Link href="/organizacion/tareas" className="block min-w-[150px] snap-start outline-none">
                        <div className="glass p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-blue-500/30 transition-colors h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CheckSquare className="h-5 w-5 text-blue-500 mb-1" />
                            <p className="text-muted-foreground text-xs font-medium">Tareas</p>
                            <p className="text-xl font-bold">{pendingTasksCount} pend.</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Gráfico Principal */}
                <Card className="glass lg:col-span-4 h-96 flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>Flujo de Efectivo</CardTitle>
                        <CardDescription>Ingresos vs Egresos por día de actividad</CardDescription>
                    </CardHeader>
                    <div className="flex-1 min-h-0">
                        <DashboardChart data={chartData} />
                    </div>
                </Card>

                {/* Panel lateral — Servicios próximos + Suscripciones */}
                <Card className="glass lg:col-span-3 overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-border/50 bg-muted/5 pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Vencimientos Inminentes</CardTitle>
                            {services.length > 0 && (
                                <Badge variant="destructive" className="text-[10px]">
                                    {services.length} esta semana
                                </Badge>
                            )}
                        </div>
                        <CardDescription>Servicios y suscripciones próximas</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        <div className="divide-y divide-border/50">
                            {services.map((svc, i) => {
                                const days = daysUntil(svc.due_date)
                                const isUrgent = days <= 2
                                return (
                                    <div key={'svc_' + i} className={`flex items-center p-4 hover:bg-muted/10 transition-colors ${isUrgent ? 'bg-destructive/5' : ''}`}>
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold uppercase mr-4 ${isUrgent ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {isUrgent ? <AlertCircle className="h-4 w-4" /> : svc.name.substring(0, 1)}
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none">{svc.name}</p>
                                            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
                                                {days === 0 ? 'Vence HOY' : days === 1 ? 'Vence mañana' : `En ${days} días`}
                                            </p>
                                        </div>
                                        {svc.amount && (
                                            <div className={`ml-auto font-medium text-sm px-2 py-1 rounded-md ${isUrgent ? 'text-destructive bg-destructive/10' : 'text-amber-500 bg-amber-500/10'}`}>
                                                -{formatCurrency(svc.amount)}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {subs.length === 0 && services.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground text-sm">
                                    No hay vencimientos próximos anotados
                                </div>
                            ) : (
                                subs.map((sub, i) => (
                                    <div key={i} className="flex items-center p-4 hover:bg-muted/10 transition-colors">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary uppercase mr-4">
                                            {sub.name.substring(0, 1)}
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none">{sub.name}</p>
                                            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
                                                Vence: {formatDate(new Date(sub.next_date))}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                                            -{formatCurrency(sub.amount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
