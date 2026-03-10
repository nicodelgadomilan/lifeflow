'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, TrendingUp, TrendingDown, Pencil, Trash2, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate, CURRENCY_SYMBOLS, CURRENCY_LABELS } from '@/lib/utils/formatters'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteTransaction, updateTransaction } from '@/app/(app)/actions/finanzas'
import { convertToARS } from '@/lib/utils/formatters'
import { useExchangeRates } from '@/lib/hooks/use-exchange-rates'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const CURRENCY_BADGE_COLORS: Record<string, string> = {
    ARS: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    USD: 'text-green-400 border-green-400/30 bg-green-400/10',
    USD_BLUE: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    EUR: 'text-violet-400 border-violet-400/30 bg-violet-400/10',
}


interface Transaction {
    id: string
    date: string
    description: string
    category: string
    type: 'income' | 'expense'
    amount: number
    currency?: string
    amount_ars?: number
}

const CURRENCIES = ['ARS', 'USD', 'USD_BLUE', 'EUR']


function TxActions({ tx }: { tx: Transaction }) {
    const [deleting, setDeleting] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editType, setEditType] = useState(tx.type)
    const [editCategory, setEditCategory] = useState(tx.category)
    const [editCurrency, setEditCurrency] = useState(tx.currency || 'ARS')
    const [editAmount, setEditAmount] = useState(String(tx.amount))
    const { rates } = useExchangeRates()
    const router = useRouter()

    async function handleDelete() {
        if (!confirm('¿Eliminar esta transacción?')) return
        setDeleting(true)
        const res = await deleteTransaction(tx.id)
        if (res.error) { toast.error(res.error); setDeleting(false) }
        else { toast.success('Transacción eliminada'); router.refresh() }
    }

    async function handleEdit(formData: FormData) {
        setSaving(true)
        formData.set('type', editType)
        formData.set('category', editCategory)
        formData.set('currency', editCurrency)
        const numAmount = parseFloat(editAmount) || 0
        const arsValue = convertToARS(numAmount, editCurrency, rates)
        formData.set('amount_ars', arsValue.toString())
        const res = await updateTransaction(tx.id, formData)
        setSaving(false)
        if (res.error) toast.error(res.error)
        else { toast.success('Transacción actualizada'); setEditOpen(false); router.refresh() }
    }

    if (deleting) return null

    return (
        <>
            <div className="flex items-center gap-1 justify-end">
                <button
                    onClick={() => setEditOpen(true)}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                    title="Editar"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleDelete}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Eliminar"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[440px] glass border-primary/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-primary" /> Editar Transacción
                        </DialogTitle>
                    </DialogHeader>
                    <form action={handleEdit} className="space-y-4 pt-2">
                        {/* Tipo */}
                        <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
                            <button type="button" onClick={() => setEditType('expense')}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${editType === 'expense' ? 'bg-destructive/20 text-destructive border border-destructive/40' : 'text-muted-foreground hover:bg-muted/50'}`}>
                                Egreso
                            </button>
                            <button type="button" onClick={() => setEditType('income')}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${editType === 'income' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' : 'text-muted-foreground hover:bg-muted/50'}`}>
                                Ingreso
                            </button>
                        </div>
                        {/* Monto + Moneda */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Monto</Label>
                                <Input name="amount" type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Moneda</Label>
                                <Select value={editCurrency} onValueChange={(v) => v && setEditCurrency(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map(c => <SelectItem key={c} value={c}>{CURRENCY_LABELS[c] || c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Categoría */}
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select value={editCategory} onValueChange={(v) => v && setEditCategory(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {editType === 'income' ? (
                                        <>
                                            <SelectItem value="Sueldo">Sueldo / Honorarios</SelectItem>
                                            <SelectItem value="Freelance">Freelance</SelectItem>
                                            <SelectItem value="Inversiones">Inversiones</SelectItem>
                                            <SelectItem value="Reembolso">Reembolso</SelectItem>
                                            <SelectItem value="Varios">Varios Ingresos</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="Varios">Varios</SelectItem>
                                            <SelectItem value="Supermercado">Supermercado</SelectItem>
                                            <SelectItem value="Transporte">Transporte / Nafta</SelectItem>
                                            <SelectItem value="Hogar">Servicios y Hogar</SelectItem>
                                            <SelectItem value="Ocio">Ocio y Salidas</SelectItem>
                                            <SelectItem value="Salud">Salud</SelectItem>
                                            <SelectItem value="Ropa">Ropa / Indumentaria</SelectItem>
                                            <SelectItem value="Tecnología">Tecnología</SelectItem>
                                            <SelectItem value="Educacion">Educación</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-tx-desc">Descripción</Label>
                                <Input id="edit-tx-desc" name="description" defaultValue={tx.description} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-tx-date">Fecha</Label>
                                <Input id="edit-tx-date" name="date" type="date" defaultValue={tx.date} required />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
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

    // Usa amount_ars si existe (transacciones multimoneda), sino usa amount directamente
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount_ars ?? t.amount), 0)
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount_ars ?? t.amount), 0)

    function exportCSV() {
        const headers = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Moneda', 'Monto Original', 'Equivalente ARS']
        const rows = filtered.map(t => [
            t.date,
            t.description || '',
            t.category,
            t.type === 'income' ? 'Ingreso' : 'Egreso',
            t.currency || 'ARS',
            t.amount.toString(),
            (t.amount_ars ?? t.amount).toString()
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
                            <TableHead>Moneda</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                                    No hay transacciones que coincidan con los filtros.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginated.map(t => {
                                const currency = t.currency || 'ARS'
                                const isNonARS = currency !== 'ARS'
                                const symbol = CURRENCY_SYMBOLS[currency] || currency
                                const displayAmount = isNonARS
                                    ? `${symbol} ${Number(t.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    : formatCurrency(t.amount)
                                const arsDisplay = isNonARS && t.amount_ars
                                    ? formatCurrency(t.amount_ars)
                                    : null
                                return (
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
                                        <TableCell>
                                            <Badge variant="outline" className={`text-[10px] h-5 ${CURRENCY_BADGE_COLORS[currency] || 'text-muted-foreground border-border/30'}`}>
                                                {currency}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-emerald-500' : ''}`}>
                                            <div>{t.type === 'expense' ? '-' : '+'}{displayAmount}</div>
                                            {arsDisplay && (
                                                <div className="text-[10px] text-muted-foreground font-normal">≈ {arsDisplay}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <TxActions tx={t} />
                                        </TableCell>
                                    </TableRow>
                                )
                            })
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
