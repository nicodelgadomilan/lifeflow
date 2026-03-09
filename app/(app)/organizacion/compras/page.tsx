import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, ListChecks, CheckCircle2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/formatters'
import { ShoppingFormDialog } from '@/components/organizacion/shopping-form'
import { ShoppingItemRow } from '@/components/organizacion/shopping-item'
import { ShoppingClearButton } from '@/components/organizacion/shopping-clear'

export default async function ComprasPage() {
    const supabase = await createClient()

    // 1. Fetch Compras
    const { data: items } = await supabase
        .from('shopping_items')
        .select('*')
        .order('is_checked', { ascending: true }) // Not checked first
        .order('created_at', { ascending: false })

    const shoppingItems = (items || []) as any[]

    const pendingItems = shoppingItems.filter(i => !i.is_checked)
    const checkedItems = shoppingItems.filter(i => i.is_checked)

    const totalPendingCost = pendingItems.reduce((acc, current) => acc + (current.price || 0), 0)
    const totalCheckedCost = checkedItems.reduce((acc, current) => acc + (current.price || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lista de Compras</h1>
                    <p className="text-muted-foreground mt-1">
                        Organiza tu mercado y gestiona tu presupuesto mensual de supermercado.
                    </p>
                </div>
            </div>

            {/* Banner superior de progreso */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass card-hover border-sky-500/20 bg-sky-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-500">
                            A Comprar
                        </CardTitle>
                        <div className="p-2 bg-sky-500/10 rounded-full">
                            <ListChecks className="h-4 w-4 text-sky-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-sky-500">{pendingItems.length}</div>
                        <p className="text-xs font-medium text-sky-500/80 mt-1">Est. {formatCurrency(totalPendingCost)}</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-500">
                            En el Carrito
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <ShoppingCart className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{checkedItems.length}</div>
                        <p className="text-xs font-medium text-emerald-500/80 mt-1">Gastado: {formatCurrency(totalCheckedCost)}</p>
                    </CardContent>
                </Card>

                <Card className="glass card-hover hidden md:flex flex-col justify-center items-center text-center">
                    <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">Tu supermercado inteligente</p>
                </Card>
            </div>

            <div className="grid md:grid-cols-12 gap-6">

                {/* LISTA PRINCIPAL */}
                <Card className="glass md:col-span-8 lg:col-span-9 flex flex-col min-h-[500px] border-sky-500/10">
                    <CardHeader className="border-b border-border/50 bg-sky-500/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Mi Lista</CardTitle>
                            <CardDescription>Tus productos a conseguir</CardDescription>
                        </div>
                        <ShoppingFormDialog />
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto w-full">
                            {shoppingItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center opacity-50 h-[300px]">
                                    <ShoppingCart className="h-12 w-12 text-sky-500 mb-4 opacity-50" />
                                    <p className="text-sm max-w-[200px]">Tu lista está vacía. Empezá a llenarla para tu próxima compra.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col w-full divide-y divide-border/20">
                                    {pendingItems.map((item) => (
                                        <ShoppingItemRow key={item.id} item={item} />
                                    ))}

                                    {checkedItems.length > 0 && (
                                        <>
                                            <div className="bg-muted/30 px-4 py-2 flex items-center justify-between mt-4 sticky top-0">
                                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center">
                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> En el carrito
                                                </span>
                                                <ShoppingClearButton />
                                            </div>
                                            {checkedItems.map((item) => (
                                                <ShoppingItemRow key={item.id} item={item} />
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* AYUDANTE O SUGERENCIAS */}
                <Card className="glass md:col-span-4 lg:col-span-3 h-fit border-dashed border-sky-500/30">
                    <CardContent className="p-6 text-center space-y-4 text-sky-500/70">
                        <span className="text-4xl block">💡</span>
                        <h3 className="font-semibold text-sky-500">¿Sabías qué?</h3>
                        <p className="text-sm">
                            Hacer las compras con una lista armada en casa te ayuda a reducir hasta un 20% los gastos impulsivos semanales y comer más saludable.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
