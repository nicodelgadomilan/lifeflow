'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateExchangeRates, ExchangeRates } from '@/app/(app)/actions/settings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw, DollarSign } from 'lucide-react'

interface Props {
    settings: ExchangeRates
}

export function CurrencySettingsForm({ settings }: Props) {
    const [loading, setLoading] = useState(false)
    const [displayCurrency, setDisplayCurrency] = useState(settings.display_currency || 'ARS')
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData(e.currentTarget)
        fd.set('display_currency', displayCurrency)
        const res = await updateExchangeRates(fd)
        setLoading(false)
        if (res.error) { toast.error(res.error); return }
        toast.success('Tipos de cambio actualizados 💱')
        router.refresh()
    }

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <input type="hidden" name="display_currency" value={displayCurrency} />

            {/* Tasas de cambio */}
            <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="usd_rate" className="flex items-center gap-2">
                            <span className="text-base">🇺🇸</span>
                            USD Oficial (1 USD = ? ARS)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                                id="usd_rate"
                                name="usd_rate"
                                type="number"
                                step="0.01"
                                min="1"
                                defaultValue={settings.usd_rate}
                                className="pl-7"
                                required
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">Dólar BCRA / Banco</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="usd_blue_rate" className="flex items-center gap-2">
                            <span className="text-base">💵</span>
                            USD Blue (1 USD = ? ARS)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                                id="usd_blue_rate"
                                name="usd_blue_rate"
                                type="number"
                                step="0.01"
                                min="1"
                                defaultValue={settings.usd_blue_rate}
                                className="pl-7"
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">Dólar informal / paralelo</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eur_rate" className="flex items-center gap-2">
                            <span className="text-base">🇪🇺</span>
                            EUR (1 EUR = ? ARS)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                                id="eur_rate"
                                name="eur_rate"
                                type="number"
                                step="0.01"
                                min="1"
                                defaultValue={settings.eur_rate}
                                className="pl-7"
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">Euro a peso argentino</p>
                    </div>
                </div>

                {/* Ejemplo de conversión en tiempo real */}
                <ExampleConversion />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                    💡 Actualizá manualmente cuando cambie el tipo de cambio
                </p>
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Actualizar Tasas
                </Button>
            </div>
        </form>
    )
}

function ExampleConversion() {
    const [amount, setAmount] = useState(100)
    const [usdRate, setUsdRate] = useState(1000)

    return (
        <div className="bg-muted/10 border border-border/30 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vista previa de conversión</p>
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <Label className="text-xs">USD</Label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        className="mt-1"
                        min="0"
                    />
                </div>
                <div className="text-muted-foreground pt-5">×</div>
                <div className="flex-1">
                    <Label className="text-xs">Tasa USD/ARS</Label>
                    <Input
                        type="number"
                        value={usdRate}
                        onChange={e => setUsdRate(Number(e.target.value))}
                        className="mt-1"
                        min="0"
                    />
                </div>
                <div className="text-muted-foreground pt-5">=</div>
                <div className="flex-1">
                    <Label className="text-xs text-emerald-400">ARS Equivalente</Label>
                    <div className="mt-1 h-10 flex items-center px-3 rounded-md border border-emerald-500/30 bg-emerald-500/10">
                        <span className="text-emerald-400 font-black">
                            ${(amount * usdRate).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
