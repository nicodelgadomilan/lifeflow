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
import { addShoppingItem } from '@/app/(app)/actions/organizacion-compras'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ShoppingFormDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await addShoppingItem(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Producto agregado a la lista')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={!children ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 h-10 px-4 py-2" : "cursor-pointer"}>
                {children ? children : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Ítem
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-sky-500/30">
                <DialogHeader>
                    <DialogTitle>Nuevo Producto</DialogTitle>
                    <DialogDescription>
                        Agrega un artículo a tu lista de supermercado o pendientes a comprar.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Producto</Label>
                        <Input id="name" name="name" placeholder="Ej: Leche descremada" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Sección</Label>
                            <Select name="category" defaultValue="Almacén">
                                <SelectTrigger>
                                    <SelectValue placeholder="Sección" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Frescos">Frescos</SelectItem>
                                    <SelectItem value="Almacén">Almacén</SelectItem>
                                    <SelectItem value="Limpieza">Limpieza</SelectItem>
                                    <SelectItem value="Verdulería">Verdulería</SelectItem>
                                    <SelectItem value="Ferretería">Ferretería</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio aprox. (Opcional)</Label>
                            <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-sky-500 text-white hover:bg-sky-600">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Agregar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
