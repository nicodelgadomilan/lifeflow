import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, MoreVertical, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { SubscriptionFormDialog } from '@/components/finanzas/subscription-form'

export default async function SuscripcionesPage() {
    const supabase = await createClient()

    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('is_active', { ascending: false })
        .order('next_date', { ascending: true })

    if (error) {
        console.error('Error cargando suscripciones:', error)
    }

    // Calcular el gasto mensual estimado (solo de las activas, asumiendo mensualidad estándar por MVP)
    const activeSubs = (subscriptions as any[])?.filter(s => s.is_active) || []
    const estimatedMonthly = activeSubs.reduce((acc, curr) => {
        if (curr.cycle === 'monthly') return acc + Number(curr.amount)
        if (curr.cycle === 'yearly') return acc + (Number(curr.amount) / 12)
        if (curr.cycle === 'weekly') return acc + (Number(curr.amount) * 4)
        return acc
    }, 0)

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suscripciones</h1>
                    <p className="text-muted-foreground mt-1">
                        Revisá tus pagos recurrentes mensuales o anuales
                    </p>
                </div>
                <SubscriptionFormDialog>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Suscripción
                    </Button>
                </SubscriptionFormDialog>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass card-hover border-destructive/20 bg-destructive/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-destructive">
                            Gasto Mensual Estimado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">{formatCurrency(estimatedMonthly)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Basado en tus suscripciones activas (calculado)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">

                {(subscriptions as any[])?.map((sub) => (
                    <Card key={sub.id} className={`glass shadow-lg border-border/50 relative overflow-hidden group hover:-translate-y-1 transition-transform ${!sub.is_active && 'opacity-60 grayscale'}`}>
                        <div className="absolute top-0 right-0 p-3">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardHeader className="pb-2">
                            <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center mb-2 font-bold text-primary uppercase">
                                {sub.name.substring(0, 1)}
                            </div>
                            <CardTitle className="text-lg">{sub.name}</CardTitle>
                            <CardDescription>{sub.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{formatCurrency(sub.amount)}</span>
                                <span className="text-sm text-muted-foreground">
                                    / {sub.cycle === 'monthly' ? 'mes' : sub.cycle === 'yearly' ? 'año' : 'semana'}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 pt-3 pb-3 flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 mt-4">
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                Vence: {formatDate(new Date(sub.next_date))}
                            </div>
                            {sub.is_active ? (
                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-[10px] leading-3 h-5">
                                    Activa
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground border-muted text-[10px] leading-3 h-5">
                                    Inactiva
                                </Badge>
                            )}
                        </CardFooter>
                    </Card>
                ))}

                {/* Empty State / Add New */}
                <SubscriptionFormDialog>
                    <Card className="glass shadow-none border-dashed border-2 flex flex-col items-center justify-center p-6 text-center h-full min-h-[220px] bg-background/50 hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <PlusCircle className="h-6 w-6 text-primary" />
                        </div>
                        <p className="font-medium text-primary">Agregar suscripción</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">Registra otro pago para llevar su control</p>
                    </Card>
                </SubscriptionFormDialog>
            </div>
        </div>
    )
}
