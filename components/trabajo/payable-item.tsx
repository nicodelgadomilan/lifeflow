'use client'
import { markPayablePaid, deletePayable } from '@/app/(app)/actions/trabajo'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Trash2, Clock, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'

export function PayableItem({ item }: { item: any }) {
    const router = useRouter()
    const isPaid = item.status === 'paid'
    const daysLeft = item.due_date ? Math.ceil((new Date(item.due_date).getTime() - Date.now()) / 86400000) : null
    const isOverdue = daysLeft !== null && daysLeft < 0 && !isPaid

    async function pay() {
        await markPayablePaid(item.id)
        toast.success('Pago marcado como realizado')
        router.refresh()
    }

    async function del() {
        if (!confirm('¿Eliminar pago?')) return
        await deletePayable(item.id)
        router.refresh()
    }

    return (
        <Card className={`glass border-border/40 ${isOverdue ? 'border-rose-500/30 bg-rose-500/5' : ''} ${isPaid ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${isPaid ? 'bg-muted/30' : isOverdue ? 'bg-rose-500/20' : 'bg-rose-500/10'}`}>
                    {isOverdue ? <AlertTriangle className="h-5 w-5 text-rose-400" /> : <CheckCircle2 className={`h-5 w-5 ${isPaid ? 'text-muted-foreground' : 'text-rose-500/50'}`} />}
                </div>
                <div className="flex-1">
                    <p className={`font-semibold ${isPaid ? 'line-through text-muted-foreground' : ''}`}>{item.concept}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span>🏢 {item.vendor}</span>
                        {daysLeft !== null && (
                            <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                                <Clock className="h-3 w-3 inline mr-1" />
                                {isOverdue ? `Vencido hace ${Math.abs(daysLeft)}d` : `Vence en ${daysLeft}d`}
                            </span>
                        )}
                        {item.work_projects && <span>📁 {item.work_projects.name}</span>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-black text-rose-400 text-lg">{formatCurrency(Number(item.amount))}</p>
                    {item.currency !== 'ARS' && <p className="text-[10px] text-muted-foreground">{item.currency}</p>}
                </div>
                <div className="flex gap-1">
                    {!isPaid && (
                        <button onClick={pay} className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-colors">
                            <CheckCircle2 className="h-4 w-4" />
                        </button>
                    )}
                    <button onClick={del} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
