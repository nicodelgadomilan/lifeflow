'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { toggleRepairStatus, deleteRepair } from '@/app/(app)/actions/vehiculo'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface RepairProps {
    repair: any
}

export function ReparacionItem({ repair }: RepairProps) {
    const [loading, setLoading] = useState(false)
    const isDone = repair.status === 'done'

    async function handleToggle() {
        setLoading(true)
        const toastId = toast.loading('Actualizando estado...')
        const newStatus = isDone ? 'pending' : 'done'
        const res = await toggleRepairStatus(repair.id, newStatus)
        setLoading(false)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success(newStatus === 'done' ? '¡Reparación marcada como completada!' : 'Reparación reactivada', { id: toastId })
    }

    async function handleDelete() {
        if (!confirm('¿Eliminar esta nota de reparación?')) return
        setLoading(true)
        const toastId = toast.loading('Eliminando...')
        const res = await deleteRepair(repair.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Eliminada', { id: toastId })
    }

    if (loading && !repair) return null

    const priorityColors: Record<string, string> = {
        low: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        urgent: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    }

    const prioLabels: Record<string, string> = {
        low: 'Estético/Bajo',
        medium: 'Normal',
        urgent: 'Urgente / Seguridad'
    }

    return (
        <Card className={`glass relative group border-border/40 transition-all ${isDone ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <CardContent className="p-4" style={{ borderLeftWidth: '4px', borderLeftColor: isDone ? '#64748b' : (repair.priority === 'urgent' ? '#f43f5e' : (repair.priority === 'low' ? '#6366f1' : '#f59e0b')) }}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h3 className={`font-bold ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{repair.description}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${priorityColors[repair.priority]}`}>
                                {repair.priority === 'urgent' && <AlertTriangle className="h-3 w-3" />}
                                {prioLabels[repair.priority]}
                            </span>
                            {repair.estimated_cost && (
                                <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded border border-border/50">
                                    Presupuesto: ${repair.estimated_cost}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant={isDone ? 'outline' : 'default'}
                            size="sm"
                            className={`h-8 ${isDone ? '' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                            onClick={handleToggle}
                        >
                            {isDone ? <Clock className="h-4 w-4 sm:mr-2" /> : <CheckCircle className="h-4 w-4 sm:mr-2" />}
                            <span className="hidden sm:inline">{isDone ? 'Reabrir' : 'Completar'}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
