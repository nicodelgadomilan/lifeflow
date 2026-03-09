import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { TransactionFormDialog } from '@/components/finanzas/transaction-form'

export default async function TransaccionesPage() {
    // Componente Server-side: Hacemos fetch directo en el render para max SEO y speed.
    const supabase = await createClient()

    // Traemos las transacciones del usuario, ordenadas por fecha más reciente
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error cargando transacciones:', error)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona todos tus ingresos y gastos
                    </p>
                </div>
                {/* Formulario Cliente inyectado acá */}
                <TransactionFormDialog />
            </div>

            <Card className="glass">
                <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar transacción..."
                                className="pl-9 bg-background/50"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background/50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                <Filter className="mr-2 h-4 w-4" /> Filtros
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[120px]">Fecha</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!transactions || transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        Aún no tienes transacciones registradas. ¡Creá la primera pulsando "Nueva Transacción"!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (transactions as any[]).map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">{formatDate(new Date(t.date))}</TableCell>
                                        <TableCell>{t.description || '-'}</TableCell>
                                        <TableCell>{t.category}</TableCell>
                                        <TableCell>
                                            {t.type === 'expense' ? (
                                                <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">Egreso</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Ingreso</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                                            {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
