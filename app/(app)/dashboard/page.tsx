import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CalendarClock, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { DashboardChart } from '@/components/finanzas/dashboard-chart'

export default async function DashboardPage() {
    const supabase = await createClient()

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

    // Agrupación y Mapeo
    const tx = (transactions || []) as any[]
    const subs = (subscriptions || []) as any[]

    // Balance mensual y Gastos
    let totalIncome = 0
    let totalExpense = 0

    // Gráfico de los ultimos dias/movimientos agrupados por fecha
    const groupedData: Record<string, { name: string; Ingresos: number; Egresos: number }> = {}

    for (const t of tx) {
        if (t.type === 'income') totalIncome += Number(t.amount)
        if (t.type === 'expense') totalExpense += Number(t.amount)

        const dateStr = t.date.substring(5, 10) // MM-DD
        if (!groupedData[dateStr]) groupedData[dateStr] = { name: dateStr, Ingresos: 0, Egresos: 0 }

        if (t.type === 'income') groupedData[dateStr].Ingresos += Number(t.amount)
        if (t.type === 'expense') groupedData[dateStr].Egresos += Number(t.amount)
    }

    const chartData = Object.values(groupedData).slice(-14) // Últimos 14 días con movimientos
    const balance = totalIncome - totalExpense
    const isBalancePositive = balance >= 0

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Bienvenido a tu resumen principal de LifeHub
                </p>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className={`glass card-hover ${isBalancePositive ? 'border-emerald-500/20' : 'border-destructive/20'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Balance Total
                        </CardTitle>
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
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Gastos Acumulados
                        </CardTitle>
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            En transacciones procesadas
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Próximos Pagos
                        </CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-full">
                            <CalendarClock className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{subs.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Suscripciones detectadas
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tareas Pendientes
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <Target className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Módulo en desarrollo (Fase 2)
                        </p>
                    </CardContent>
                </Card>
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

                {/* Panel lateral de utilidades */}
                <Card className="glass lg:col-span-3 overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-border/50 bg-muted/5">
                        <CardTitle>Vencimientos Inminentes</CardTitle>
                        <CardDescription>
                            Tus suscripciones registradas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        <div className="divide-y divide-border/50">
                            {subs.length === 0 ? (
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
