'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, FileWarning, Key, ExternalLink, Paperclip } from 'lucide-react'
import { deleteVehicleDocument } from '@/app/(app)/actions/vehiculo'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface DocProps {
    doc: any
}

export function PapelItem({ doc }: DocProps) {
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar/borrar este registro de papeles?')) return
        setDeleting(true)
        const toastId = toast.loading('Eliminando...')
        const res = await deleteVehicleDocument(doc.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Documento eliminado', { id: toastId })
    }

    if (deleting) return null

    const dateObj = new Date(doc.expiry_date)
    const timeDiff = dateObj.getTime() - new Date().getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))

    // Logic for color
    const isExpired = daysLeft < 0
    const isUrgent = daysLeft >= 0 && daysLeft <= 15
    const isOk = daysLeft > 15

    let stateColor = 'border-amber-500 text-amber-500' // neutral
    if (isExpired) stateColor = 'border-rose-500 text-rose-500 bg-rose-500/10'
    else if (isUrgent) stateColor = 'border-orange-500 text-orange-500 bg-orange-500/10'
    else if (isOk) stateColor = 'border-emerald-500 text-emerald-500 bg-emerald-500/10'

    return (
        <Card className={`glass relative group border-border/40 transition-all overflow-hidden ${isExpired ? 'border-rose-400/50 grayscale-0 shadow-lg shadow-rose-500/20' : ''}`}>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex w-full items-center gap-4">
                    <div
                        className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center border-2 ${stateColor}`}
                    >
                        {isExpired ? <FileWarning className="w-5 h-5" /> : <Key className="w-5 h-5 opacity-80" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                            {doc.name}
                            {isExpired && <span className="text-[10px] uppercase font-black tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded-full">Vencido</span>}
                        </h3>
                        <p className="text-sm font-mono mt-1 flex items-center gap-2 text-muted-foreground">
                            {dateObj.toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {!isExpired && (
                        <div className="text-right">
                            <span className={`text-xl font-bold block ${isUrgent ? 'text-orange-500 animate-pulse' : 'text-emerald-500'}`}>
                                {daysLeft}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1">días faltan</span>
                        </div>
                    )}
                    {/* Botón ver documento adjunto */}
                    {doc.file_url ? (
                        <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors font-medium"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver doc
                        </a>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground/50 border border-dashed border-border/30 px-2 py-1 rounded">
                            <Paperclip className="h-3 w-3" /> Sin archivo
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
