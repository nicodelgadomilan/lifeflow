'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bolt, Droplets, Flame, Search, FileText, Loader2, PlusCircle, Wifi } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addService } from '@/app/(app)/actions/servicios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ServicioForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addService(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Servicio agregado, pendiente de pago')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Nuevo Servicio
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-primary/30">
                <DialogHeader>
                    <DialogTitle>Nuevo Servicio</DialogTitle>
                    <DialogDescription>
                        Añade una factura de luz, agua, expensas, etc. a pagar.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Empresa u Organismo</Label>
                        <Input id="name" name="name" placeholder="Ej: Edenor, Metrogas, Consorcio..." required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Select name="category" defaultValue="Luz">
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Luz"><div className="flex items-center gap-2"><Bolt className="h-4 w-4" /> Luz/Energía</div></SelectItem>
                                    <SelectItem value="Agua"><div className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Agua</div></SelectItem>
                                    <SelectItem value="Gas"><div className="flex items-center gap-2"><Flame className="h-4 w-4" /> Gas</div></SelectItem>
                                    <SelectItem value="Internet"><div className="flex items-center gap-2"><Wifi className="h-4 w-4" /> Internet/Cable</div></SelectItem>
                                    <SelectItem value="Expensas"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Expensas</div></SelectItem>
                                    <SelectItem value="General"><div className="flex items-center gap-2"><Search className="h-4 w-4" /> Otro</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Vencimiento</Label>
                            <Input id="due_date" name="due_date" type="date" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto Original (Opcional)</Label>
                        <Input id="amount" name="amount" type="number" step="0.01" placeholder="Ej: 75000" />
                        <p className="text-[10px] text-muted-foreground">Si no lo sabes exacto ahora, lo confirmas al pagar.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Agregar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
