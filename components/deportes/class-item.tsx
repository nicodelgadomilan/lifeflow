'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Clock, MapPin } from 'lucide-react'
import { deleteSportClass } from '@/app/(app)/actions/deportes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SportClassProps {
    sportClass: any
}

export function SportClassItem({ sportClass }: SportClassProps) {
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar esta clase?')) return
        setDeleting(true)
        const toastId = toast.loading('Eliminando...')
        const res = await deleteSportClass(sportClass.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Clase eliminada', { id: toastId })
    }

    if (deleting) return null

    // Helper para formato de hora (solo HH:MM)
    const formatTime = (timeString: string) => {
        if (!timeString) return ''
        return timeString.substring(0, 5) // "14:30:00" -> "14:30"
    }

    const start = formatTime(sportClass.start_time)
    const end = sportClass.end_time ? formatTime(sportClass.end_time) : ''

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayName = dayNames[sportClass.day_of_week]

    return (
        <Card className="glass relative group flex flex-col overflow-hidden transition-all hover:shadow-lg border-border/40">
            <div
                className="absolute top-0 left-0 w-1.5 h-full opacity-70"
                style={{ backgroundColor: sportClass.color || '#3b82f6' }}
            />
            <CardContent className="p-4 pl-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-semibold text-lg">{sportClass.name}</h3>
                        <Badge variant="outline" className="text-[10px] mt-1 uppercase tracking-widest text-primary border-primary/30">
                            {dayName}
                        </Badge>
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

                <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 opacity-70" />
                        {start} {end ? `- ${end}` : ''}
                    </div>
                    {sportClass.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2 opacity-70" />
                            {sportClass.location}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
