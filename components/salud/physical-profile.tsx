'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Settings2, User } from 'lucide-react'
import { updatePhysicalProfile } from '@/app/(app)/actions/salud'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
    currentHeight?: number
    currentGender?: string
}

export function PhysicalProfileCard({ currentHeight, currentGender }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await updatePhysicalProfile(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Perfil físico actualizado')
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Card className="glass border-sky-500/20 mb-6 bg-sky-500/5">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex flex-col items-center justify-center text-sky-500">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Perfil Físico</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                            <span>{currentGender || 'Sin especificar'}</span>
                            <span>•</span>
                            <span>{currentHeight ? `${currentHeight} cm` : 'Sin altura'}</span>
                        </p>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger render={
                        <Button variant="outline" size="sm" className="h-8 border-sky-500/30 text-sky-500 hover:bg-sky-500/10">
                            <Settings2 className="h-4 w-4 mr-2" />
                            Ajustar
                        </Button>
                    } />
                    <DialogContent className="sm:max-w-[425px] glass border-sky-500/30">
                        <DialogHeader>
                            <DialogTitle>Ajustes de Perfil Físico</DialogTitle>
                        </DialogHeader>
                        <form action={onSubmit} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="gender">Sexo / Género</Label>
                                <Select name="gender" defaultValue={currentGender || "Hombre"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione genero" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hombre">Hombre</SelectItem>
                                        <SelectItem value="Mujer">Mujer</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="height">Altura (cm)</Label>
                                <Input
                                    id="height"
                                    name="height"
                                    type="number"
                                    step="0.1"
                                    placeholder="Ej: 175"
                                    defaultValue={currentHeight}
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-sky-500 text-white hover:bg-sky-600">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
