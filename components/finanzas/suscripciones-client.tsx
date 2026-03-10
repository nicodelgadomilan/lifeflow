'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, convertToARS, formatCurrency, CURRENCY_SYMBOLS } from '@/lib/utils/formatters'
import { useExchangeRates } from '@/lib/hooks/use-exchange-rates'
import { SubscriptionFormDialog } from './subscription-form'
import { SubscriptionActions } from './subscription-actions'
import { PlusCircle } from 'lucide-react'

interface Subscription {
    id: string
    name: string
    amount: number
    currency: string
    cycle: string
    category: string
    next_date: string
    is_active: boolean
}

interface Props {
    subscriptions: Subscription[]
}

const CURRENCY_BADGE_COLORS: Record<string, string> = {
    ARS: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    USD: 'text-green-400 border-green-400/30 bg-green-400/10',
    USD_BLUE: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    EUR: 'text-violet-400 border-violet-400/30 bg-violet-400/10',
}

function formatAmountInCurrency(amount: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency
    if (currency === 'ARS') return formatCurrency(amount, 'ARS')
    return `${symbol} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function SuscripcionesClient({ subscriptions }: Props) {
    const { rates } = useExchangeRates()

    const activeSubs = subscriptions.filter(s => s.is_active)

    // Total mensual convertido a ARS
    const estimatedMonthly = activeSubs.reduce((acc, sub) => {
        const amountARS = convertToARS(Number(sub.amount), sub.currency || 'ARS', rates)
        if (sub.cycle === 'monthly') return acc + amountARS
        if (sub.cycle === 'yearly') return acc + amountARS / 12
        if (sub.cycle === 'weekly') return acc + amountARS * 4
        return acc
    }, 0)

    // Desglose por moneda
    const byCurrency = activeSubs.reduce<Record<string, number>>((acc, sub) => {
        const cur = sub.currency || 'ARS'
        const amount = sub.cycle === 'monthly' ? Number(sub.amount)
            : sub.cycle === 'yearly' ? Number(sub.amount) / 12
                : Number(sub.amount) * 4
        acc[cur] = (acc[cur] || 0) + amount
        return acc
    }, {})

    return (
        <div className="space-y-6">
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
                            Todo convertido a ARS · basado en tus tasas de cambio
                        </p>
                        {/* Desglose por moneda */}
                        {Object.keys(byCurrency).length > 1 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {Object.entries(byCurrency).map(([cur, amount]) => (
                                    <span
                                        key={cur}
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CURRENCY_BADGE_COLORS[cur] || 'text-muted-foreground border-border/30'}`}
                                    >
                                        {formatAmountInCurrency(amount, cur)}/mes
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">
                {subscriptions.map((sub) => {
                    const currency = sub.currency || 'ARS'
                    const isNonARS = currency !== 'ARS'
                    const arsEquiv = isNonARS
                        ? convertToARS(Number(sub.amount), currency, rates)
                        : null

                    return (
                        <Card key={sub.id} className={`glass shadow-lg border-border/50 relative overflow-hidden group hover:-translate-y-1 transition-transform ${!sub.is_active && 'opacity-60 grayscale'}`}>
                            <div className="absolute top-0 right-0 p-3">
                                <SubscriptionActions sub={sub} />
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
                                    <span className="text-2xl font-bold">
                                        {formatAmountInCurrency(Number(sub.amount), currency)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        / {sub.cycle === 'monthly' ? 'mes' : sub.cycle === 'yearly' ? 'año' : 'semana'}
                                    </span>
                                </div>
                                {/* Badge de moneda + conversión */}
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] h-5 ${CURRENCY_BADGE_COLORS[currency] || ''}`}
                                    >
                                        {currency}
                                    </Badge>
                                    {isNonARS && arsEquiv !== null && (
                                        <span className="text-[11px] text-muted-foreground">
                                            ≈ {formatCurrency(arsEquiv)}
                                        </span>
                                    )}
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
                    )
                })}

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
