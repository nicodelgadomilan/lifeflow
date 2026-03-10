'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Transaction {
    id: string
    date: string
    description: string
    category: string
    type: 'income' | 'expense'
    amount: number
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6']

interface Props {
    transactions: Transaction[]
}

export function TransaccionesClient({ transactions }: Props) {
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [page, setPage] = useState(1)
    const PER_PAGE = 20

    const categories = useMemo(() => {
        const cats = Array.from(new Set(transactions.map(t => t.category))).sort()
        return cats
    }, [transactions])

    const filtered = useMemo(() => {
        return transactions.filter(t => {
            const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
            const matchType = typeFilter === 'all' || t.type === typeFilter
            const matchCat = categoryFilter === 'all' || t.category === categoryFilter
            return matchSearch && matchType && matchCat
        })
    }, [transactions, search, typeFilter, categoryFilter])

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const totalPages = Math.ceil(filtered.length / PER_PAGE)

    // Donut data — expenses by category
    const donutData = useMemo(() => {
        const expensesByCat: Record<string, number> = {}
        filtered.filter(t => t.type === 'expense').forEach(t => {
            expensesByCat[t.category] = (expensesByCat[t.category] || 0) + Number(t.amount)
        })
        return Object.entries(expensesByCat)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
    }, [filtered])

    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

    function exportCSV() {
        const headers = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']
        const rows = filtered.map(t => [
            t.date,
            t.description || '',
            t.category,
            t.type === 'income' ? 'Ingreso' : 'Egreso',
            t.amount.toString()
        ])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transacciones_${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Ingresos filtrados</p>
                    <p className="text-xl font-bold text-emerald-500 flex items-center gap-1"><TrendingUp className="h-4 w-4" />{formatCurrency(totalIncome)}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-destructive/20 bg-destructive/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Egresos filtrados</p>
                    <p className="text-xl font-bold text-destructive flex items-center gap-1"><TrendingDown className="h-4 w-4" />{formatCurrency(totalExpense)}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-border/30 col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Resultado neto</p>
                    <p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                        {formatCurrency(totalIncome - totalExpense)}
                    </p>
                </div>
            </div>

            {/* Donut chart + filters side by side */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Donut */}
                {donutData.length > 0 && (
                    <div className="glass rounded-xl p-4 border border-border/30">
                        <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Egresos por categoría</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {donutData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Filters */}
                <div className="glass rounded-xl p-4 border border-border/30 flex flex-col gap-3 justify-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Filtros</p>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por descripción o categoría..."
                            className="pl-9 bg-background/50"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={typeFilter} onValueChange={(v: any) => { setTypeFilter(v); setPage(1) }}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                <SelectItem value="income">Solo Ingresos</SelectItem>
                                <SelectItem value="expense">Solo Egresos</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={(v: string | null) => { if (v) { setCategoryFilter(v); setPage(1) } }}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" className="self-start" onClick={exportCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV ({filtered.length})
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-xl border border-border/30 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-muted/10">
                            <TableHead className="w-[110px]">Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                    No hay transacciones que coincidan con los filtros.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginated.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium text-sm">{formatDate(new Date(t.date))}</TableCell>
                                    <TableCell className="text-sm">{t.description || '–'}</TableCell>
                                    <TableCell>
                                        <span className="text-xs bg-muted/40 px-2 py-0.5 rounded-full">{t.category}</span>
                                    </TableCell>
                                    <TableCell>
                                        {t.type === 'expense'
                                            ? <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">Egreso</Badge>
                                            : <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Ingreso</Badge>}
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-emerald-500' : ''}`}>
                                        {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 bg-muted/5">
                        <p className="text-xs text-muted-foreground">{filtered.length} transacciones • Página {page} de {totalPages}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
                            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
