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
        <div className="space-y-6 animate-fade-in">

            {/* HEADER con saludo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hola, {userName} 👋</h1>
                    <p className="text-muted-foreground mt-1">
                        {today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* ═══ HÁBITOS — PRIMERA SECCIÓN (lo más importante) ═══ */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 border border-rose-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-rose-500/5 via-background to-muted/10">
                {/* Orb decorativo */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-10 bg-rose-500 pointer-events-none" />

                <div className="lg:col-span-4 flex flex-col justify-center gap-4 z-10 relative">
                    <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm">
                        <CalendarCheck className="h-4 w-4" />
                        Hábitos Diarios
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Desarrollá hábitos</h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed">
                        La constancia es la clave del éxito. Registrá tus hábitos diarios y construí la disciplina que te lleva a tus metas.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                        <Link href="/salud/habitos">
                            <Button variant="outline" className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 bg-background/50 backdrop-blur-sm">
                                + Nuevo Hábito
                            </Button>
                        </Link>
                        <Link href="/metas">
                            <Button variant="outline" className="border-border/60 hover:bg-muted bg-background/50 backdrop-blur-sm">
                                Ver Metas
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="lg:col-span-3 z-10 relative mt-6 lg:mt-0">
                    <HabitWidget habits={habits} />
                </div>
            </div>

            {/* ═══ BOTONES DE ACCIÓN RÁPIDA ═══ */}
            <div className="glass rounded-2xl border border-border/40 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">⚡ Acciones Rápidas</p>
                <div className="flex gap-3 overflow-x-auto pb-2 flex-nowrap sm:flex-wrap sm:pb-0 hide-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
                    <TransactionFormDialog
                        defaultType="income"
                        trigger={
                            <button className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95">
                                <ArrowUpRight className="h-4 w-4" />
                                + Ingreso
                            </button>
                        }
                    />
                    <TransactionFormDialog
                        defaultType="expense"
                        trigger={
                            <button className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-destructive/20 hover:bg-destructive/30 border border-destructive/40 text-rose-400 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95">
                                <ArrowDownRight className="h-4 w-4" />
                                − Egreso
                            </button>
                        }
                    />
                    <Link href="/finanzas" className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold text-sm transition-all hover:scale-[1.02]">
                        <BarChart3 className="h-4 w-4" />
                        Finanzas
                    </Link>
                    <Link href="/trabajo" className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-semibold text-sm transition-all hover:scale-[1.02]">
                        💼 Trabajo
                    </Link>
                    <Link href="/organizacion/tareas" className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold text-sm transition-all hover:scale-[1.02]">
                        <CheckSquare className="h-4 w-4" />
                        Tareas
                    </Link>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className={`glass card-hover ${isBalancePositive ? 'border-emerald-500/20' : 'border-destructive/20'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Balance Total</CardTitle>
                        <div className={`p-2 rounded-full ${isBalancePositive ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                            <Wallet className={`h-4 w-4 ${isBalancePositive ? 'text-emerald-500' : 'text-destructive'}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isBalancePositive ? 'text-emerald-500' : 'text-destructive'}`}>
                            {formatCurrency(balance)}
                        </div>
                        <p className={`text-xs flex items-center mt-1 font-medium ${isBalancePositive ? 'text-emerald-500' : 'text-destructive'}`}>
                            {isBalancePositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                            {formatCurrency(totalIncome)} ingresos
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-destructive/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Acumulados</CardTitle>
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">En transacciones procesadas</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Próximos Pagos</CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-full">
                            <CalendarClock className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{subs.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Suscripciones detectadas</p>
                    </CardContent>
                </Card>

                <Link href="/organizacion/tareas" className="block">
                    <Card className={`glass card-hover h-full ${pendingTasksCount > 0 ? 'border-blue-500/20' : 'border-emerald-500/20'}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tareas Pendientes</CardTitle>
                            <div className={`p-2 rounded-full ${pendingTasksCount > 0 ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                                <CheckSquare className={`h-4 w-4 ${pendingTasksCount > 0 ? 'text-blue-500' : 'text-emerald-500'}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${pendingTasksCount > 0 ? 'text-blue-500' : 'text-emerald-500'}`}>
                                {pendingTasksCount}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {pendingTasksCount === 0 ? '¡Todo al día! 🎉' : 'tareas sin completar'}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
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
