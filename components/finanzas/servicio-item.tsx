'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Flame, Droplets, Bolt, Wifi, FileText, Search, CreditCard, ChevronRight } from 'lucide-react'
import { deleteService, payService } from '@/app/(app)/actions/servicios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from '@/components/ui/badge'

interface ServicioProps {
    service: any
}

export function ServicioItem({ service }: ServicioProps) {
    const [deleting, setDeleting] = useState(false)
    const [paying, setPaying] = useState(false)
    const [payOpen, setPayOpen] = useState(false)

    // Calculate next month suggestion date
    const originDate = new Date(service.due_date || new Date())
    const nextDate = new Date(originDate)
    nextDate.setMonth(nextDate.getMonth() + 1)
    const nextDateStr = nextDate.toISOString().split('T')[0]

    async function handleDelete() {
        if (!confirm('¿Seguro quieres eliminar este registro?')) return
        setDeleting(true)
        const toastId = toast.loading('Eliminando...')
        const res = await deleteService(service.id)
        if (res.error) toast.error(res.error, { id: toastId })
        else toast.success('Registro eliminado', { id: toastId })
    }

    async function handlePay(formData: FormData) {
        const finalAmountStr = formData.get('amount') as string
        const nextDue = formData.get('nextDue') as string
        const parsed = finalAmountStr ? parseFloat(finalAmountStr) : (service.amount || 0)

        if (!parsed || parsed <= 0) {
            toast.error('Especifica un monto válido pagado.')
            return
        }

        setPaying(true)
        const toastId = toast.loading('Registrando pago y creando próximo mes sugerido...')

        const res = await payService(service.id, parsed, service.name, service.category, nextDue)
        setPaying(false)

        if (res.error) {
            toast.error(res.error, { id: toastId })
        } else {
            toast.success('Servicio pagado. Registro mensual actualizado.', { id: toastId })
            setPayOpen(false)
        }
    }

    if (deleting) return null

    // Decorate by Category
    const catDecorators: Record<string, { icon: any, col: string }> = {
        'Luz': { icon: Bolt, col: 'text-yellow-500 bg-yellow-500/10' },
        'Agua': { icon: Droplets, col: 'text-blue-500 bg-blue-500/10' },
        'Gas': { icon: Flame, col: 'text-orange-500 bg-orange-500/10' },
        'Internet': { icon: Wifi, col: 'text-violet-500 bg-violet-500/10' },
        'Expensas': { icon: FileText, col: 'text-emerald-500 bg-emerald-500/10' },
        'General': { icon: Search, col: 'text-muted-foreground bg-muted/20' }
    }

    const decor = catDecorators[service.category] || catDecorators['General']
    const IconCmp = decor.icon

    // Calc days left
    const dateObj = new Date(service.due_date)
    const timeDiff = dateObj.getTime() - new Date().getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))

    const isExpired = daysLeft < 0 && !service.is_paid
    const isUrgent = daysLeft >= 0 && daysLeft <= 5 && !service.is_paid

    return (
        <Card className={`glass relative group border-border/40 hover:bg-muted/10 transition-colors 
            ${isExpired ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' : ''}
            ${service.is_paid ? 'opacity-70 grayscale-[0.8] hover:grayscale-0 border-emerald-500/20' : ''}
        `}>
            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex w-full items-center gap-4">
                    <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center border-2 border-transparent ${decor.col} ${service.is_paid ? 'opacity-50' : ''} ${isExpired ? '!border-rose-500 !text-rose-500 !bg-rose-500/10' : ''}`}>
                        <IconCmp className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-bold ${service.is_paid ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {service.name}
                            </h3>
                            {service.is_paid && <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 text-[10px] uppercase font-bold px-1.5 h-4">Pagado el {formatDate(new Date(service.paid_date))}</Badge>}
                            {isExpired && !service.is_paid && <Badge variant="destructive" className="h-5 text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-sm animate-pulse">Vencido {Math.abs(daysLeft)}d</Badge>}
                        </div>
                        <p className={`text-xs mt-1 font-medium ${isUrgent ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {service.is_paid ? 'Ciclo cerrado' : `Vence: ${formatDate(dateObj)}`}
                            {!service.is_paid && isUrgent && ` (en ${daysLeft} días)`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className={`text-lg font-bold ${service.is_paid ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {service.amount ? formatCurrency(service.amount) : 'Pendiente'}
                    </span>

                    {!service.is_paid ? (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                                <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3 gap-1 cursor-pointer">
                                    <CreditCard className="h-4 w-4" /> Pagar
                                </DialogTrigger>
                                <DialogContent className="glass border-primary/30 sm:max-w-[400px]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" /> Confirmar Pago
                                        </DialogTitle>
                                        <DialogDescription>
                                            Saldar "{service.name}" genera automáticamente la sugerencia del próximo mes en tu calendario.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form action={handlePay} className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground text-xs uppercase tracking-widest">Abonado Real ($) al proveedor</Label>
                                            <Input autoFocus name="amount" type="number" step="0.01" defaultValue={service.amount || ''} required />
                                        </div>

                                        <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/50">
                                            <Label className="text-xs flex items-center gap-1 text-primary"><ChevronRight className="h-3 w-3" /> Sugerencia próximo vencimiento</Label>
                                            <Input name="nextDue" type="date" defaultValue={nextDateStr} className="h-8 h-8 text-sm" />
                                            <p className="text-[10px] text-muted-foreground leading-tight">Este servicio aparecerá nuevamente para este día, asumiendo el mismo costo exacto sugerido pagado hoy.</p>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button variant="ghost" type="button" onClick={() => setPayOpen(false)}>Cancelar</Button>
                                            <Button disabled={paying} type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                                Registrar Pago {paying && '...'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
