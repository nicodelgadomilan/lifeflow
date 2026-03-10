import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { TransactionFormDialog } from '@/components/finanzas/transaction-form'
import { TransaccionesClient } from '@/components/finanzas/transacciones-client'

export default async function TransaccionesPage() {
    const supabase = await createClient()

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
                        Gestiona todos tus ingresos y gastos con filtros y análisis
                    </p>
                </div>
                <TransactionFormDialog />
            </div>

            <TransaccionesClient transactions={(transactions || []) as any} />
        </div>
    )
}
