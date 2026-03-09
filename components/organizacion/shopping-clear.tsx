'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { clearCheckedItems } from '@/app/(app)/actions/organizacion-compras'
import { toast } from 'sonner'

export function ShoppingClearButton() {
    const [loading, setLoading] = useState(false)

    async function handleClear() {
        if (!confirm('¿Seguro quieres vaciar los ítems marcados como listos?')) return
        setLoading(true)
        const toastId = toast.loading('Limpiando canasta...')
        const res = await clearCheckedItems()
        setLoading(false)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Canasta vaciada. ¡Guardado en el historial!', { id: toastId })
    }

    return (
        <button
            type="button"
            className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-destructive group-hover:opacity-100 transition-opacity disabled:opacity-50 font-medium"
            onClick={handleClear}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            Limpiar Todos
        </button>
    )
}
