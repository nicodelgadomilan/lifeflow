'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteCalendarEvent } from '@/app/(app)/actions/organizacion-calendario'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface EventItemProps {
    event: any
}

export function CalendarEventItem({ event }: EventItemProps) {
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar este evento?')) return
        setDeleting(true)
        const toastId = toast.loading('Eliminando evento...')
        const res = await deleteCalendarEvent(event.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Evento eliminado', { id: toastId })
    }

    if (deleting) return null

    // Date formatting functions
    const startDate = new Date(event.start_date)
    const timeStr = event.all_day
        ? 'Todo el día'
        : startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const typeDetails: Record<string, { label: string, colorClass: string }> = {
        event: { label: 'Evento General', colorClass: 'border-blue-500/50 text-blue-500' },
        meeting: { label: 'Reunión', colorClass: 'border-violet-500/50 text-violet-500' },
        birthday: { label: 'Cumpleaños', colorClass: 'border-amber-500/50 text-amber-500' },
        reminder: { label: 'Recordatorio', colorClass: 'border-emerald-500/50 text-emerald-500' }
    }

    const { colorClass } = typeDetails[event.type] || typeDetails.event

    return (
        <div className={`p-3 rounded-lg border-l-4 ${colorClass} bg-muted/20 relative group transition-colors hover:bg-muted/40 mb-3`}>
            <div className="flex justify-between items-start pr-6">
                <div>
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{timeStr}</p>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete() }}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    )
}
