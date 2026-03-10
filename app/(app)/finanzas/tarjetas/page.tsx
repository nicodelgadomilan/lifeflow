import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Landmark, CreditCard, Banknote, ShieldAlert, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TarjetaForm } from '@/components/finanzas/tarjeta-form'
import { TarjetaItem } from '@/components/finanzas/tarjeta-item'
import { formatCurrency } from '@/lib/utils/formatters'

export default async function TarjetasPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: cardsResponse } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('limit_amount', { ascending: false })

    const cards = (cardsResponse || []) as any[]

    // Dashboard calculations
    const totalLimit = cards.reduce((acc, c) => acc + (Number(c.limit_amount) || 0), 0)
    const totalDebt = cards.reduce((acc, c) => acc + (Number(c.used_amount) || 0), 0)
    const availableTotal = Math.max(0, totalLimit - totalDebt)
    const usageRatio = totalLimit > 0 ? (totalDebt / totalLimit) * 100 : 0
    const totalInterestEstimated = cards.reduce((acc, c) => acc + ((Number(c.used_amount) || 0) * ((Number(c.interest_rate) || 0) / 100)), 0)

    let healthStatus = 'Excelente'
    let healthColor = 'text-emerald-500 bg-emerald-500/10'
    let alertMessage = 'Tus plásticos están bajo control. Sigue así manteniéndote siempre a raya con tus pagos.'

    if (usageRatio > 40) {
        healthStatus = 'Precaución'
        healthColor = 'text-amber-500 bg-amber-500/10'
        alertMessage = 'Estás acercándote al 50% de tu capacidad crediticia. Trata de no adquirir nuevas cuotas hasta no reducir deuda.'
    }
    if (usageRatio > 75) {
        healthStatus = 'Riesgo Alto'
        healthColor = 'text-rose-500 bg-rose-500/10'
        alertMessage = 'Alerta Financiera: Sobreendeudamiento. Evalúa un plan de consolidación o cese inmediato de gastos con tarjeta.'
    }

    return (
        <div className="space-y-6 animate-fade-in mx-auto max-w-6xl pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tarjetas de Crédito</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Saca el máximo provecho evaluando tu porcentaje de uso, cupo disponible e intereses.
                    </p>
                </div>
                <TarjetaForm />
            </div>

            {/* Global Plan / Dashboard Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

                {/* Financial Health Snapshot */}
                <Card className="glass md:col-span-2 flex flex-col justify-center border-border/40 bg-gradient-to-br from-background to-muted/20 relative overflow-hidden group">
                    <div className="p-6 md:p-8 relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Salud Crediticia</h4>
                                <p className={`text-2xl sm:text-3xl font-black ${healthColor.split(' ')[0]}`}>{healthStatus}</p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-full inline-flex font-bold text-sm ${healthColor} shadow-inner`}>
                                {usageRatio.toFixed(1)}% Usado
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
                            {alertMessage}
                        </p>
                    </div>
                </Card>

                <Card className="glass flex flex-col justify-center border-l-4 border-l-emerald-500/50 p-6 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <p className="text-xs text-emerald-500/80 mb-1 font-semibold tracking-widest uppercase">Cupo Disponible Global</p>
                    <p className="text-3xl font-black text-emerald-500 truncate">{formatCurrency(availableTotal)}</p>
                    <p className="text-xs text-muted-foreground mt-2 opacity-70">De un límite total sumado de {formatCurrency(totalLimit)}</p>
                </Card>

                <Card className="glass flex flex-col justify-center border-l-4 border-l-rose-500/50 p-6 bg-gradient-to-br from-rose-500/5 to-transparent relative">
                    <Banknote className="absolute right-4 bottom-4 h-16 w-16 opacity-5 rotate-[-10deg]" />
                    <p className="text-xs text-rose-500/80 mb-1 font-semibold tracking-widest uppercase flex items-center gap-1">Deuda Acumulada</p>
                    <p className="text-3xl font-black text-rose-500 truncate">{formatCurrency(totalDebt)}</p>
                    <div className="mt-2 text-[11px] font-semibold flex items-center gap-1 text-amber-500 bg-amber-500/10 w-fit px-2 py-1 rounded-sm">
                        + {formatCurrency(totalInterestEstimated)} en intereses aprox.
                    </div>
                </Card>
            </div>

            {/* Plan de Pago y Liquidación Section */}
            <div className="bg-muted/30 border border-primary/20 rounded-xl p-4 md:p-6 mb-8 mt-4 glass flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-primary font-bold"><Landmark className="h-5 w-5" /> Plan de Pago Inteligente</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                        Si tienes múltiples deudas, aplica el método **Bola de Nieve** (paga primero la tarjeta con menor deuda acumulada para ganar inercia) o **Avalancha** (ataca la que tenga el Interés Mensual % más alto). Elige un pago total e ingresa tu abono en las tarjetas debajo.
                    </p>
                </div>
            </div>

            {/* List of Credit Cards */}
            {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center opacity-50 bg-muted/5 rounded-2xl border border-dashed border-primary/20 h-[300px] mt-8">
                    <CreditCard className="h-16 w-16 text-primary/50 mb-4 opacity-50" />
                    <p className="max-w-[250px] text-sm font-medium text-primary/80">No has registrado tarjetas de crédito en tu cartera digital aún.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {cards.map((c) => (
                        <TarjetaItem key={c.id} card={c} />
                    ))}
                </div>
            )}
        </div>
    )
}
