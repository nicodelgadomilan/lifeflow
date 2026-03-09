'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pin, Trash2 } from 'lucide-react'
import { deleteNote } from '@/app/(app)/actions/organizacion'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/formatters'

interface NoteItemProps {
    note: any
}

export function NoteItem({ note }: NoteItemProps) {
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar esta nota?')) return
        setDeleting(true)
        const toastId = toast.loading('Eliminando nota...')
        const res = await deleteNote(note.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Nota eliminada', { id: toastId })
    }

    if (deleting) return null

    return (
        <Card className="glass relative group flex flex-col h-full overflow-hidden transition-all hover:shadow-lg border-border/40 hover:border-amber-500/50">
            {note.is_pinned && (
                <div className="absolute top-0 right-0 p-2 text-amber-500 opacity-80">
                    <Pin className="h-4 w-4 fill-current rotate-45" />
                </div>
            )}

            <CardHeader className="pb-2 relative">
                <div
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ backgroundColor: note.color || '#fbbf24' }}
                />
                <CardTitle className="text-lg pr-6 pl-2 leading-tight">
                    {note.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pl-8">
                <p className="text-sm text-foreground/80 whitespace-pre-wrap flex-1 mb-4">
                    {note.content}
                </p>

                <div className="mt-auto flex justify-between items-center border-t border-border/50 pt-3">
                    <span className="text-[10px] text-muted-foreground">
                        {formatDate(new Date(note.created_at))}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
