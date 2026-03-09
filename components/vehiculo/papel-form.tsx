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
import { PlusCircle, Loader2 } from 'lucide-react'
import { addVehicleDocument } from '@/app/(app)/actions/vehiculo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PapelesForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addVehicleDocument(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Documento agendado')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Vencimiento
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-amber-500/30">
                <DialogHeader>
                    <DialogTitle>Alta de Documento Vehicular</DialogTitle>
                    <DialogDescription>
                        Registra el pago de patente o el vencimiento de tu RTO/VTV.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tipo de Documento</Label>
                        <Select name="name" defaultValue="VTV">
                            <SelectTrigger>
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VTV / RTO">VTV / RTO</SelectItem>
                                <SelectItem value="Seguro">Póliza de Seguro</SelectItem>
                                <SelectItem value="Patente">Patente (Matrícula)</SelectItem>
                                <SelectItem value="Cedula">Cédula Verde / Azul</SelectItem>
                                <SelectItem value="Registro">Registro Conducir</SelectItem>
                                <SelectItem value="Otro">Otro (Especifique notas)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiry_date">Fecha Límite / Vencimiento</Label>
                        <Input id="expiry_date" name="expiry_date" type="date" required />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-amber-500 text-black hover:bg-amber-600">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Agendar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
