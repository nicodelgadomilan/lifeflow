import { getUserSettings } from '@/app/(app)/actions/settings'
import { CurrencySettingsForm } from '@/components/settings/currency-settings-form'
import { Settings, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/formatters'

export default async function ConfiguracionPage() {
    const settings = await getUserSettings()

    const lastUpdated = settings.rates_updated_at
        ? new Date(settings.rates_updated_at).toLocaleString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
        : 'Nunca actualizado'

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pt-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings className="h-7 w-7 text-primary" />
                    Configuración
                </h1>
                <p className="text-muted-foreground mt-1">Personalizá tu experiencia en LifeHub</p>
            </div>

            {/* Estado actual de tasas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'USD Oficial', value: settings.usd_rate, symbol: 'USD', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                    { label: 'USD Blue', value: settings.usd_blue_rate, symbol: 'USD', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                    { label: 'Euro', value: settings.eur_rate, symbol: 'EUR', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                ].map(r => (
                    <div key={r.label} className={`glass rounded-xl p-4 border ${r.bg} col-span-1`}>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{r.label}</p>
                        <p className={`text-xl font-black ${r.color}`}>${r.value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                        <p className="text-[10px] text-muted-foreground">1 {r.symbol} en ARS</p>
                    </div>
                ))}
                <div className="glass rounded-xl p-4 border border-border/30 col-span-1 sm:col-span-1 flex flex-col justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-[10px] text-muted-foreground">Última actualización</p>
                    <p className="text-xs font-semibold text-foreground">{lastUpdated}</p>
                </div>
            </div>

            {/* Formulario de configuración */}
            <Card className="glass border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Tipos de Cambio
                    </CardTitle>
                    <CardDescription>
                        Actualizá los valores manualmente para que todos tus totales se conviertan a pesos argentinos.
                        Los cobros en USD se mostrarán tanto en la moneda original como en su equivalente en ARS.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CurrencySettingsForm settings={settings} />
                </CardContent>
            </Card>

            {/* Como afecta */}
            <Card className="glass border-border/30">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        ¿Cómo afecta esto a la app?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">💰</span>
                            <span><strong className="text-foreground">Transacciones:</strong> Al cargar un ingreso o egreso, podés elegir la moneda (ARS, USD, EUR). El monto se convierte a ARS automáticamente.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">📊</span>
                            <span><strong className="text-foreground">Dashboard y Finanzas:</strong> Todos los totales se muestran en ARS, usando la tasa aquí configurada.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">🧾</span>
                            <span><strong className="text-foreground">Cobros y Pagos de Trabajo:</strong> Los cobros en USD muestran el monto original y su equivalente en ARS según el tipo de cambio actual.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">⚠️</span>
                            <span><strong className="text-foreground">Importante:</strong> Al cambiar la tasa, todos los montos se recalculan con el nuevo valor. El monto original siempre se conserva.</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
