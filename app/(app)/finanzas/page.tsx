import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { DashboardChart } from '@/components/finanzas/dashboard-chart'
import { Badge } from '@/components/ui/badge'

export default async function FinanzasResumenPage() {
    const supabase = await createClient()

    // 1. Fetch Transacciones
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true })

    const tx = (transactions || []) as any[]

    let currentMonthIncome = 0
    let currentMonthExpense = 0

    // Default chart grouping by month
    const groupedData: Record<string, { name: string; Ingresos: number; Egresos: number }> = {}

    // Get current month to filter metrics
    const now = new Date()
    const currentMonthPrefix = now.toISOString().substring(0, 7) // YYYY-MM

    for (const t of tx) {
        if (t.date.startsWith(currentMonthPrefix)) {
            if (t.type === 'income') currentMonthIncome += Number(t.amount)
            if (t.type === 'expense') currentMonthExpense += Number(t.amount)
        }

        const monthStr = t.date.substring(0, 7) // YYYY-MM
        if (!groupedData[monthStr]) groupedData[monthStr] = { name: monthStr, Ingresos: 0, Egresos: 0 }

        if (t.type === 'income') groupedData[monthStr].Ingresos += Number(t.amount)
        if (t.type === 'expense') groupedData[monthStr].Egresos += Number(t.amount)
    }

    const chartData = Object.values(groupedData).slice(-6) // Últimos 6 meses
    const netBalance = currentMonthIncome - currentMonthExpense
    const isNetPositive = netBalance >= 0

    // Para la lista de recientes (últimas 5)
    const recentTx = [...tx].reverse().slice(0, 5)

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
                    <p className="text-muted-foreground mt-1">
                        Resumen general de tu estado financiero mensual
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/finanzas/transacciones" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Transacción
                    </Link>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-500">
                            Ingresos del mes
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{formatCurrency(currentMonthIncome)}</div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-destructive/20 bg-destructive/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-destructive">
                            Egresos del mes
                        </CardTitle>
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">{formatCurrency(currentMonthExpense)}</div>
                    </CardContent>
                </Card>

                <Card className={`glass card-hover ${isNetPositive ? 'border-primary/20 bg-primary/5' : 'border-destructive/20 bg-destructive/5'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`text-sm font-medium ${isNetPositive ? 'text-primary' : 'text-destructive'}`}>
                            Saldo Neto
                        </CardTitle>
                        <div className={`p-2 rounded-full ${isNetPositive ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                            <Wallet2 className={`h-4 w-4 ${isNetPositive ? 'text-primary' : 'text-destructive'}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{formatCurrency(netBalance)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Gráfico de Área — estilo dark premium */}
                <Card className="lg:col-span-4 h-[400px] flex flex-col bg-zinc-950 border-zinc-800/60 shadow-2xl overflow-hidden">
                    <div className="flex-1 min-h-0 p-5 pb-3">
                        <DashboardChart data={chartData} />
                    </div>
                </Card>

                {/* Últimas transacciones */}
                <Card className="glass lg:col-span-3 overflow-hidden flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/5 pb-4">
                        <div>
                            <CardTitle>Últimas Transacciones</CardTitle>
                            <CardDescription>Tus movimientos recientes</CardDescription>
                        </div>
                        <Link href="/finanzas/transacciones" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                            <span className="text-xs">Ver Todas</span>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        <div className="divide-y divide-border/50">
                            {recentTx.length === 0 ? (
                                <div className="flex flex-col items-center text-center opacity-50 p-12">
                                    <p className="text-sm text-muted-foreground">No hay transacciones registradas aún.</p>
                                </div>
                            ) : (
                                recentTx.map((t, i) => (
                                    <div key={i} className="flex items-center p-4 hover:bg-muted/10 transition-colors">
                                        <div className="space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none">{t.description || t.category}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {formatDate(new Date(t.date))}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {t.type === 'expense' ? (
                                                <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px] h-5">Egreso</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-[10px] h-5">Ingreso</Badge>
                                            )}
                                            <div className={`font-semibold text-sm w-20 text-right ${t.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                            </div>
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
