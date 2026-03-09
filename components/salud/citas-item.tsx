'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, AlertCircle, Building2 } from 'lucide-react'
import { deleteAppointment } from '@/app/(app)/actions/salud'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AppointProps {
    appointment: any
}

export function AppointmentItem({ appointment }: AppointProps) {
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('¿Seguro quieres cancelar/eliminar esta cita?')) return
        setDeleting(true)
        const toastId = toast.loading('Eliminando turno...')
        const res = await deleteAppointment(appointment.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Turno eliminado', { id: toastId })
    }

    if (deleting) return null

    const dateObj = new Date(appointment.date)
    const isPast = dateObj < new Date()
    const colorClass = isPast ? 'border-muted-foreground/30 text-muted-foreground' : 'border-rose-500/50 text-rose-500'

    return (
        <Card className={`glass relative group flex flex-col overflow-hidden transition-all hover:shadow-lg border-border/40 ${isPast ? 'opacity-50' : ''}`}>
            <CardContent className="p-4 pl-5 border-l-4" style={{ borderColor: isPast ? '#64748b' : '#f43f5e' }}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className={`font-bold ${isPast ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{appointment.type}</h3>
                        <p className="text-sm font-medium mt-1">🩺 {appointment.doctor}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
                    <Badge variant="outline" className={`text-xs ${colorClass} bg-muted/20 px-2 py-0.5`}>
                        {dateObj.toLocaleString()}
                    </Badge>
                    {isPast && (
                        <span className="text-[10px] mt-2 sm:mt-0 italic opacity-70">Visita completada</span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
