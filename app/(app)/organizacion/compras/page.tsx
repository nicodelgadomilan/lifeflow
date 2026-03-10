import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, ListChecks, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/formatters'
import { ShoppingFormDialog } from '@/components/organizacion/shopping-form'
import { ShoppingItemRow } from '@/components/organizacion/shopping-item'
import { ShoppingClearButton } from '@/components/organizacion/shopping-clear'
import { ShoppingModeToggle } from '@/components/organizacion/shopping-mode-toggle'

export default async function ComprasPage() {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('shopping_items')
        .select('*')
        .order('is_checked', { ascending: true })
        .order('category', { ascending: true })
        .order('created_at', { ascending: false })

    const shoppingItems = (items || []) as any[]
    const pendingItems = shoppingItems.filter(i => !i.is_checked)
    const checkedItems = shoppingItems.filter(i => i.is_checked)

    const totalPendingCost = pendingItems.reduce((acc, c) => acc + (c.price || 0), 0)
    const totalCheckedCost = checkedItems.reduce((acc, c) => acc + (c.price || 0), 0)

    // Group pending by category
    const pendingByCategory: Record<string, any[]> = {}
    pendingItems.forEach(item => {
        const cat = item.category || 'Sin categoría'
        if (!pendingByCategory[cat]) pendingByCategory[cat] = []
        pendingByCategory[cat].push(item)
    })

    const categoryEmojis: Record<string, string> = {
        'Lácteos': '🥛', 'Verduras': '🥦', 'Frutas': '🍎', 'Carnes': '🥩',
        'Panadería': '🍞', 'Bebidas': '🥤', 'Limpieza': '🧹', 'Higiene': '🧴',
        'Congelados': '🧊', 'Snacks': '🍿', 'Condimentos': '🧂', 'Sin categoría': '🛒'
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lista de Compras</h1>
                    <p className="text-muted-foreground mt-1">
                        Organiza tu mercado y gestiona tu presupuesto mensual.
                    </p>
                </div>
                {/* Modo compras activo */}
                <ShoppingModeToggle pendingItems={pendingItems as any} checkedItems={checkedItems as any} />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass card-hover border-sky-500/20 bg-sky-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-500">A Comprar</CardTitle>
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
                        <CardTitle className="text-sm font-medium text-emerald-500">En el Carrito</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <ShoppingCart className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{checkedItems.length}</div>
                        <p className="text-xs font-medium text-emerald-500/80 mt-1">Gastado: {formatCurrency(totalCheckedCost)}</p>
                    </CardContent>
                </Card>

                {/* Progress */}
                <Card className="glass card-hover border-primary/10 p-4 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Progreso</p>
                    <div className="flex justify-between mb-1">
                        <span className="text-2xl font-bold">{Math.round((checkedItems.length / (shoppingItems.length || 1)) * 100)}%</span>
                        <span className="text-sm text-muted-foreground self-end">{checkedItems.length}/{shoppingItems.length}</span>
                    </div>
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(checkedItems.length / (shoppingItems.length || 1)) * 100}%` }}
                        />
                    </div>
                </Card>
            </div>

            <div className="grid md:grid-cols-12 gap-6">

                {/* LISTA PRINCIPAL con categorías */}
                <Card className="glass md:col-span-8 lg:col-span-9 flex flex-col min-h-[500px] border-sky-500/10">
                    <CardHeader className="border-b border-border/50 bg-sky-500/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Mi Lista</CardTitle>
                            <CardDescription>Organizada por categoría</CardDescription>
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
                                <div className="flex flex-col w-full">
                                    {/* Pendientes por categoría */}
                                    {Object.entries(pendingByCategory).map(([cat, catItems]) => (
                                        <div key={cat}>
                                            <div className="px-4 py-2 bg-muted/20 border-b border-border/20 flex items-center gap-2">
                                                <span className="text-sm">{categoryEmojis[cat] || '🛒'}</span>
                                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cat}</span>
                                                <span className="text-xs text-muted-foreground/50">({catItems.length})</span>
                                            </div>
                                            <div className="divide-y divide-border/20">
                                                {catItems.map(item => <ShoppingItemRow key={item.id} item={item} />)}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Checkeados */}
                                    {checkedItems.length > 0 && (
                                        <>
                                            <div className="bg-muted/30 px-4 py-2 flex items-center justify-between mt-2 border-t border-border/30">
                                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> En el carrito ({checkedItems.length})
                                                </span>
                                                <ShoppingClearButton />
                                            </div>
                                            <div className="divide-y divide-border/20 opacity-70">
                                                {checkedItems.map(item => <ShoppingItemRow key={item.id} item={item} />)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* INFO */}
                <Card className="glass md:col-span-4 lg:col-span-3 h-fit border-dashed border-sky-500/30">
                    <CardContent className="p-6 text-center space-y-4 text-sky-500/70">
                        <span className="text-4xl block">💡</span>
                        <h3 className="font-semibold text-sky-500">Tip</h3>
                        <p className="text-sm">
                            Usá el <strong>Modo Compras</strong> para ver la lista en pantalla completa y tachar items más fácil desde el supermercado.
                        </p>
                        <div className="space-y-2 text-left mt-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Categorías sugeridas</p>
                            {['Lácteos 🥛', 'Verduras 🥦', 'Carnes 🥩', 'Limpieza 🧹', 'Higiene 🧴'].map(c => (
                                <p key={c} className="text-xs text-muted-foreground">{c}</p>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
