'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { toggleShoppingItem, deleteShoppingItem } from '@/app/(app)/actions/organizacion-compras'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatters'

interface ShoppingItemProps {
    item: any
}

export function ShoppingItemRow({ item }: ShoppingItemProps) {
    const [submitting, setSubmitting] = useState(false)
    const [localChecked, setLocalChecked] = useState(item.is_checked)
    const [deleting, setDeleting] = useState(false)

    async function handleToggleStatus() {
        setSubmitting(true)
        setLocalChecked(!localChecked)
        const toastId = toast.loading('Actualizando...')
        const res = await toggleShoppingItem(item.id, item.is_checked)
        setSubmitting(false)
        if (res.error) {
            toast.error(res.error, { id: toastId })
            setLocalChecked(localChecked) // rollback
        } else {
            toast.success(localChecked ? 'Marcado como pendiente' : 'Agregado al carrito', { id: toastId })
        }
    }

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar este producto?')) return
        setDeleting(true)
        const res = await deleteShoppingItem(item.id)
        if (res.error) toast.error(res.error)
        else toast.success('Producto eliminado')
    }

    if (deleting) return null

    return (
        <div className={`flex items-center justify-between p-3 border-b border-border/50 group hover:bg-muted/10 transition-colors ${submitting ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="pt-0.5" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStatus() }}>
                    <Checkbox
                        checked={localChecked}
                        className={`h-5 w-5 rounded ${localChecked ? 'data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500' : 'border-muted-foreground/50'}`}
                    />
                </div>
                <div
                    className="flex-1 min-w-0 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between pr-4"
                    onClick={handleToggleStatus}
                >
                    <div className="flex flex-col gap-0.5">
                        <span className={`text-sm font-medium leading-none ${localChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1 sm:mt-0">
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase tracking-wider text-muted-foreground border-border/60">
                                {item.category}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                {item.price && (
                    <span className={`text-sm font-mono ${localChecked ? 'text-muted-foreground' : 'text-sky-500 font-medium'}`}>
                        {formatCurrency(item.price)}
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete() }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
