'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addTransaction } from '@/app/(app)/actions/finanzas'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { convertToARS, formatCurrency, CURRENCY_LABELS } from '@/lib/utils/formatters'

interface Props {
    defaultType?: 'income' | 'expense'
    trigger?: React.ReactNode
}

const CURRENCIES = ['ARS', 'USD', 'USD_BLUE', 'EUR']

export function TransactionFormDialog({ defaultType, trigger }: Props = {}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState<'income' | 'expense'>(defaultType || 'expense')
    const [category, setCategory] = useState('Varios')
    const [currency, setCurrency] = useState('ARS')
    const [amount, setAmount] = useState('')
    const [rates, setRates] = useState({ usd_rate: 1000, eur_rate: 1100, usd_blue_rate: 1200 })
    const router = useRouter()

    // Carga tasas de cambio del usuario
    useEffect(() => {
        if (!open) return
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return
                ; (supabase as any).from('user_settings')
                    .select('usd_rate, eur_rate, usd_blue_rate')
                    .eq('user_id', user.id)
                    .single()
                    .then(({ data }: any) => {
                        if (data) setRates({
                            usd_rate: Number(data.usd_rate) || 1000,
                            eur_rate: Number(data.eur_rate) || 1100,
                            usd_blue_rate: Number(data.usd_blue_rate) || 1200,
                        })
                    })
        })
    }, [open])

    function openDialog() {
        setType(defaultType || 'expense')
        setCategory('Varios')
        setCurrency('ARS')
        setAmount('')
        setOpen(true)
    }

    async function onSubmit(formData: FormData) {
        setLoading(true)
        formData.set('type', type)
        formData.set('category', category)
        formData.set('currency', currency)
        // Guardamos el amount_ars para uso en totales
        const numAmount = parseFloat(amount) || 0
        const amountInARS = convertToARS(numAmount, currency, rates)
        formData.set('amount_ars', amountInARS.toString())
        const res = await addTransaction(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            const label = currency !== 'ARS' ? ` (≈ ${formatCurrency(amountInARS)})` : ''
            toast.success(type === 'income' ? `💰 Ingreso registrado${label}` : `💸 Gasto registrado${label}`)
            setOpen(false)
            router.refresh()
        }
    }

    const isIncome = type === 'income'
    const numAmount = parseFloat(amount) || 0
    const amountARS = convertToARS(numAmount, currency, rates)
    const showConversion = currency !== 'ARS' && numAmount > 0

    return (
        <>
            {trigger ? (
                <span onClick={openDialog} className="contents cursor-pointer">
                    {trigger}
                </span>
            ) : (
                <Button onClick={openDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Transacción
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[460px] glass">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isIncome
                                ? <><TrendingUp className="h-5 w-5 text-emerald-500" /> Registrar Ingreso</>
                                : <><TrendingDown className="h-5 w-5 text-destructive" /> Registrar Egreso</>
                            }
                        </DialogTitle>
                        <DialogDescription>
                            Registra {isIncome ? 'tus ingresos' : 'tus gastos'} en la moneda que quieras.
                        </DialogDescription>
                    </DialogHeader>

                    <form action={onSubmit} className="space-y-4">
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="category" value={category} />
                        <input type="hidden" name="currency" value={currency} />

                        {/* Toggle Ingreso / Egreso */}
                        <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isIncome
                                    ? 'bg-destructive/20 text-destructive border border-destructive/40 shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                            >
                                <TrendingDown className="h-4 w-4" /> Egreso
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${isIncome
                                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                            >
                                <TrendingUp className="h-4 w-4" /> Ingreso
                            </button>
                        </div>

                        {/* Monto + Moneda */}
                        <div className="space-y-2">
                            <Label>Monto</Label>
                            <div className="flex gap-2">
                                <Input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className={`flex-1 text-lg font-bold ${isIncome ? 'border-emerald-500/30 focus:border-emerald-500' : 'border-destructive/30 focus:border-destructive'}`}
                                />
                                <Select value={currency} onValueChange={(v: string | null) => { if (v) setCurrency(v) }}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map(c => (
                                            <SelectItem key={c} value={c}>{CURRENCY_LABELS[c] || c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Conversión en tiempo real */}
                            {showConversion && (
                                <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                                    <span className="text-xs text-muted-foreground">Equivale a:</span>
                                    <span className="text-sm font-black text-primary">{formatCurrency(amountARS)}</span>
                                    <span className="text-[10px] text-muted-foreground ml-auto">
                                        @ ${currency === 'USD_BLUE' ? rates.usd_blue_rate : currency === 'USD' ? rates.usd_rate : rates.eur_rate}/USD
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select value={category} onValueChange={(v: string | null) => { if (v) setCategory(v) }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isIncome ? (
                                        <>
                                            <SelectItem value="Sueldo">Sueldo / Honorarios</SelectItem>
                                            <SelectItem value="Freelance">Freelance</SelectItem>
                                            <SelectItem value="Inversiones">Inversiones</SelectItem>
                                            <SelectItem value="Reembolso">Reembolso</SelectItem>
                                            <SelectItem value="Varios">Varios Ingresos</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="Varios">Varios</SelectItem>
                                            <SelectItem value="Supermercado">Supermercado</SelectItem>
                                            <SelectItem value="Transporte">Transporte / Nafta</SelectItem>
                                            <SelectItem value="Hogar">Servicios y Hogar</SelectItem>
                                            <SelectItem value="Ocio">Ocio y Salidas</SelectItem>
                                            <SelectItem value="Salud">Salud</SelectItem>
                                            <SelectItem value="Ropa">Ropa / Indumentaria</SelectItem>
                                            <SelectItem value="Tecnología">Tecnología</SelectItem>
                                            <SelectItem value="Educacion">Educación</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input id="description" name="description" placeholder="Ej: Compra en Coto" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className={isIncome ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-destructive text-white hover:bg-destructive/90'}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isIncome ? 'Guardar Ingreso' : 'Guardar Egreso'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
