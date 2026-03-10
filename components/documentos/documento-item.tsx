'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, FileText, Lock, FileDigit, ShieldAlert, MoreVertical, ExternalLink, Paperclip } from 'lucide-react'
import { deleteDocument } from '@/app/(app)/actions/documentos'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DocProps {
    doc: any
}

export function DocumentoItem({ doc }: DocProps) {
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar este registro?')) return
        setDeleting(true)
        const toastId = toast.loading('Eliminando...')
        const res = await deleteDocument(doc.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Eliminado', { id: toastId })
    }

    if (deleting) return null

    // Decorate by Category
    const catDecorators: Record<string, { icon: any, col: string }> = {
        'Personal': { icon: FileText, col: 'text-indigo-500 bg-indigo-500/10' },
        'Laboral': { icon: FileDigit, col: 'text-emerald-500 bg-emerald-500/10' },
        'Médico': { icon: ShieldAlert, col: 'text-rose-500 bg-rose-500/10' },
        'Legal': { icon: Lock, col: 'text-amber-500 bg-amber-500/10' },
        'Otro': { icon: FileText, col: 'text-muted-foreground bg-muted/20' }
    }

    const decor = catDecorators[doc.category] || catDecorators['Otro']
    const IconCmp = decor.icon

    const dateObj = doc.expiry_date ? new Date(doc.expiry_date) : null
    const isExpired = dateObj ? dateObj < new Date() : false

    return (
        <Card className={`glass relative group border-border/40 hover:bg-muted/10 transition-colors ${isExpired ? 'border-rose-500/30 shadow-lg shadow-rose-500/5' : ''}`}>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex w-full items-center gap-4">
                    <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center ${decor.col}`}>
                        <IconCmp className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-foreground flex flex-wrap items-center gap-2">
                            {doc.name}
                            {isExpired && <Badge variant="destructive" className="h-5 text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-sm">Vencido</Badge>}
                            {!isExpired && doc.category && <Badge variant="outline" className="h-5 text-[10px] text-muted-foreground border-border/50 uppercase font-black tracking-widest px-1.5 py-0.5 rounded-sm">{doc.category}</Badge>}
                        </h3>
                        {doc.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                                {doc.notes}
                            </p>
                        )}
                        {dateObj && (
                            <p className={`text-xs mt-1 ${isExpired ? 'text-rose-500 font-bold' : 'text-muted-foreground'}`}>
                                Vence: {dateObj.toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Botón de ver archivo — funcional si tiene file_url real */}
                    {doc.file_url && doc.file_url !== '#' ? (
                        <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver archivo
                        </a>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 rounded bg-muted/20 border border-dashed border-border/40">
                            <Paperclip className="h-3 w-3" /> Sin archivo
                        </span>
                    )}

                    <Popover>
                        <PopoverTrigger className="inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[160px] p-1 gap-1 flex flex-col glass border-border/50">
                            <Button variant="ghost" className="justify-start h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
        </Card>
    )
}
