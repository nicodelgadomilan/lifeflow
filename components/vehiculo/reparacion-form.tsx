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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addRepair } from '@/app/(app)/actions/vehiculo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ReparacionForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addRepair(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Problema registrado')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Reportar Falla
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-rose-500/30">
                <DialogHeader>
                    <DialogTitle>Nueva Reparación / Problema</DialogTitle>
                    <DialogDescription>
                        Anota un problema pendiente a reparar en el taller mecánico.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción Corta</Label>
                        <Input id="description" name="description" placeholder="Ej: Ruido en la rueda derecha, Luz quemada" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioridad Nivel</Label>
                            <Select name="priority" defaultValue="medium">
                                <SelectTrigger>
                                    <SelectValue placeholder="Prioridad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baja (Estético)</SelectItem>
                                    <SelectItem value="medium">Media (Atender pronto)</SelectItem>
                                    <SelectItem value="urgent">Urgente (Seguridad)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estimated_cost">Presupuesto ($)</Label>
                            <Input id="estimated_cost" name="estimated_cost" type="number" step="0.01" placeholder="Max a pagar" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-rose-500 text-white hover:bg-rose-600">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Falla
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
