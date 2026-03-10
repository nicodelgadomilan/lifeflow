'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { ServicioItem } from './servicio-item'
import { Badge } from '@/components/ui/badge'

interface MonthlyViewProps {
    services: any[]
}

export function ServiciosMonthlyView({ services }: MonthlyViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const toggleMonth = (direction: 'PREV' | 'NEXT') => {
        setCurrentDate(prev => {
            const next = new Date(prev)
            next.setMonth(prev.getMonth() + (direction === 'NEXT' ? 1 : -1))
            return next
        })
    }

    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Filter services that correspond to the currently viewed month
    // Services are stored with a due_date, we will use it to place them in the correct month
    const monthServices = services.filter(s => {
        const d = new Date(s.due_date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    // Sort: pendings first (closest due date), then paids
    monthServices.sort((a, b) => {
        if (a.is_paid !== b.is_paid) return a.is_paid ? 1 : -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })

    const totalPaid = monthServices.filter(s => s.is_paid).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    const totalPending = monthServices.filter(s => !s.is_paid).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    const totalEstimated = totalPaid + totalPending

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    const allPaid = monthServices.length > 0 && monthServices.every(s => s.is_paid)

    return (
        <div className="space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center justify-between bg-card/40 border border-primary/10 rounded-xl p-4 glass">
                <Button variant="ghost" size="icon" onClick={() => toggleMonth('PREV')} className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="text-center">
                    <h2 className="text-xl font-bold capitalize">{monthNames[currentMonth]} {currentYear}</h2>
                    {currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() && (
                        <Badge variant="outline" className="mt-1 border-primary/30 text-primary text-[10px] uppercase font-bold px-2 py-0">Mes Actual</Badge>
                    )}
                </div>

                <Button variant="ghost" size="icon" onClick={() => toggleMonth('NEXT')} className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass flex flex-col justify-center border-l-4 border-l-muted-foreground/30 p-5 bg-gradient-to-br from-background to-muted/10">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground font-semibold text-xs tracking-widest uppercase">
                        <Circle className="h-3 w-3" /> Total Estimado
                    </div>
                    <p className="text-2xl font-black">{formatCurrency(totalEstimated)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Presupuesto del mes</p>
                </Card>

                <Card className={`glass flex flex-col justify-center border-l-4 p-5 bg-gradient-to-br from-emerald-500/5 to-transparent ${allPaid ? 'border-l-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-l-emerald-500/30'}`}>
                    <div className="flex items-center gap-2 mb-2 text-emerald-500 font-semibold text-xs tracking-widest uppercase">
                        <CheckCircle2 className="h-3 w-3" /> Pagado
                    </div>
                    <p className="text-2xl font-black text-emerald-500">{formatCurrency(totalPaid)}</p>
                    <p className="text-xs text-emerald-500/80 mt-1">{monthServices.filter(s => s.is_paid).length} servicios saldados</p>
                </Card>

                <Card className="glass flex flex-col justify-center border-l-4 border-l-rose-500/50 p-5 bg-gradient-to-br from-rose-500/5 to-transparent">
                    <div className="flex items-center gap-2 mb-2 text-rose-500 font-semibold text-xs tracking-widest uppercase">
                        <AlertCircle className="h-3 w-3" /> Pendiente
                    </div>
                    <p className="text-2xl font-black text-rose-500">{formatCurrency(totalPending)}</p>
                    <p className="text-xs text-rose-500/80 mt-1">{monthServices.filter(s => !s.is_paid).length} facturas por pagar</p>
                </Card>
            </div>

            {/* List */}
            <div className="space-y-4 pt-4">
                {monthServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center opacity-50 bg-muted/5 rounded-2xl border border-dashed border-primary/20">
                        <CheckCircle2 className="h-12 w-12 text-primary/50 mb-4 opacity-50" />
                        <p className="max-w-[250px] text-sm font-medium text-primary/80">No hay servicios registrados para este mes.</p>
                        {currentDate.getTime() > new Date().getTime() && (
                            <p className="text-xs mt-2 text-muted-foreground">Los servicios sugeridos se crearán automáticamente al pagar los del mes anterior.</p>
                        )}
                    </div>
                ) : (
                    monthServices.map((s) => <ServicioItem key={s.id} service={s} />)
                )}
            </div>
        </div>
    )
}
