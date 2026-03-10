'use client'

import { useState } from 'react'
import { ShoppingCart, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShoppingItemRow } from './shopping-item'

interface Item {
    id: string
    name: string
    quantity?: number
    price?: number
    unit?: string
    category?: string
    is_checked: boolean
}

interface Props {
    pendingItems: Item[]
    checkedItems: Item[]
}

export function ShoppingModeToggle({ pendingItems, checkedItems }: Props) {
    const [activeMode, setActiveMode] = useState(false)

    if (activeMode) {
        return (
            <div className="fixed inset-0 bg-background z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/50 bg-muted/10">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="h-6 w-6 text-sky-500" />
                        <div>
                            <h2 className="text-xl font-bold">Modo Compras</h2>
                            <p className="text-sm text-muted-foreground">{pendingItems.length} items pendientes</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setActiveMode(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Items en modo grande */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {pendingItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50 gap-4">
                            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                            <p className="text-2xl font-bold text-emerald-500">¡Lista completa!</p>
                            <p className="text-muted-foreground">Todos los items fueron marcados</p>
                        </div>
                    ) : (
                        pendingItems.map(item => (
                            <div key={item.id} className="bg-muted/20 rounded-2xl border border-border/50 overflow-hidden">
                                <ShoppingItemRow item={item as any} />
                            </div>
                        ))
                    )}
                </div>

                {/* Progress bar */}
                <div className="p-4 border-t border-border/50 bg-muted/10">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>{checkedItems.length} en el carrito</span>
                        <span>{Math.round((checkedItems.length / (pendingItems.length + checkedItems.length || 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${(checkedItems.length / (pendingItems.length + checkedItems.length || 1)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="outline"
            className="border-sky-500/40 text-sky-500 hover:bg-sky-500/10"
            onClick={() => setActiveMode(true)}
        >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Modo Compras
        </Button>
    )
}
