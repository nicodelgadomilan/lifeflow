'use client'

import { useState } from 'react'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, PlusCircle, TrendingUp, Home, Bitcoin, FileBarChart, BarChart3, Package, Car } from 'lucide-react'
import { addAsset } from '@/app/(app)/actions/activos'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const ASSET_TYPES = [
    { value: 'Acciones', label: 'Acciones', icon: BarChart3, color: 'text-blue-500' },
    { value: 'Bonos', label: 'Bonos / Obligaciones', icon: FileBarChart, color: 'text-violet-500' },
    { value: 'FCI', label: 'FCI / Fondos de Inversión', icon: TrendingUp, color: 'text-emerald-500' },
    { value: 'Cripto', label: 'Criptomonedas', icon: Bitcoin, color: 'text-orange-500' },
    { value: 'Inmueble', label: 'Inmueble / Propiedad', icon: Home, color: 'text-amber-500' },
    { value: 'Físico', label: 'Activo Físico (Oro, Arte…)', icon: Package, color: 'text-yellow-500' },
    { value: 'Vehículo', label: 'Vehículo', icon: Car, color: 'text-sky-500' },
    { value: 'Otro', label: 'Otro', icon: TrendingUp, color: 'text-muted-foreground' },
]

const FINANCIAL_TYPES = ['Acciones', 'Bonos', 'FCI', 'Cripto']

export function ActivoForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [assetType, setAssetType] = useState('Acciones')
    const router = useRouter()

    const isFinancial = FINANCIAL_TYPES.includes(assetType)

    async function onSubmit(formData: FormData) {
        formData.set('type', assetType)
        setLoading(true)
        const res = await addAsset(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Activo registrado correctamente')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
                <PlusCircle className="h-4 w-4" /> Agregar Activo
            </DialogTrigger>
            <DialogContent className="sm:max-w-[490px] glass border-primary/30">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Registrar Activo / Inversión
                    </DialogTitle>
                    <DialogDescription>
                        Acciones, bonos, cripto, inmuebles, vehículos o cualquier activo de valor.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="space-y-4 pt-2">
                    {/* Type */}
                    <div className="space-y-2">
                        <Label>Tipo de Activo</Label>
                        <Select onValueChange={(v) => v && setAssetType(v)} defaultValue="Acciones">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ASSET_TYPES.map(t => {
                                    const Icon = t.icon
                                    return (
                                        <SelectItem key={t.value} value={t.value}>
                                            <span className="flex items-center gap-2">
                                                <Icon className={`h-4 w-4 ${t.color}`} /> {t.label}
                                            </span>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Name / Ticker */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Activo</Label>
                            <Input id="name" name="name" placeholder={isFinancial ? 'Ej: Apple Inc.' : 'Ej: Depto. Palermo'} required />
                        </div>
                        {isFinancial && (
                            <div className="space-y-2">
                                <Label htmlFor="ticker">Ticker / Símbolo</Label>
                                <Input id="ticker" name="ticker" placeholder="Ej: AAPL, BTC, AL30…" className="uppercase" />
                            </div>
                        )}
                        {!isFinancial && (
                            <div className="space-y-2">
                                <Label htmlFor="purchase_date">Fecha de Compra</Label>
                                <Input id="purchase_date" name="purchase_date" type="date" />
                            </div>
                        )}
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="invested_amount">Capital Invertido ($)</Label>
                            <Input id="invested_amount" name="invested_amount" type="number" step="0.01" placeholder="Precio de compra total" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current_value">Valor Actual ($) <span className="text-muted-foreground text-[10px]">(opc.)</span></Label>
                            <Input id="current_value" name="current_value" type="number" step="0.01" placeholder="Cotización hoy" />
                        </div>
                    </div>

                    {/* Financial specific */}
                    {isFinancial && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Cantidad / Unidades</Label>
                                <Input id="quantity" name="quantity" type="number" step="0.00000001" placeholder="N° de acciones o tokens" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purchase_date">Fecha de Compra</Label>
                                <Input id="purchase_date" name="purchase_date" type="date" />
                            </div>
                        </div>
                    )}

                    {/* Currency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Moneda</Label>
                            <Select name="currency" defaultValue="ARS">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ARS">🇦🇷 Peso Argentino (ARS)</SelectItem>
                                    <SelectItem value="USD">🇺🇸 Dólar (USD)</SelectItem>
                                    <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                                    <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Input id="notes" name="notes" placeholder="Broker, custodia, etc." />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading} className="font-bold">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Activo
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
