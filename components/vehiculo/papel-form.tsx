'use client'

import { useState, useRef } from 'react'
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
import { PlusCircle, Loader2, UploadCloud, FileText, X, Image, File } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PapelesForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [docType, setDocType] = useState('VTV / RTO')
    const [file, setFile] = useState<File | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]
        if (f) setFile(f)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) setFile(f)
    }

    function removeFile() {
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    function getFileIcon(type: string) {
        if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-400" />
        if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-400" />
        return <File className="h-5 w-5 text-muted-foreground" />
    }

    // Obtener o crear el vehículo del usuario
    async function getOrCreateVehicle(supabase: any, userId: string) {
        const { data: vehicles } = await supabase
            .from('vehicles')
            .select('id')
            .eq('user_id', userId)
            .limit(1)

        if (vehicles && vehicles.length > 0) return vehicles[0].id

        const { data: newCar } = await supabase
            .from('vehicles')
            .insert({ user_id: userId, name: 'Mi Auto principal', brand: 'Marca', model: 'Modelo' })
            .select()
            .single()

        return newCar?.id
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formEl = e.currentTarget
        const expiry_date = (formEl.elements.namedItem('expiry_date') as HTMLInputElement).value

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { toast.error('No autenticado'); setLoading(false); return }

        const vehicleId = await getOrCreateVehicle(supabase, user.id)
        if (!vehicleId) { toast.error('No se pudo obtener el vehículo'); setLoading(false); return }

        let file_url: string | null = null
        let file_name: string | null = null

        // Upload a Supabase Storage
        if (file) {
            const path = `${user.id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`
            const { error: uploadErr } = await supabase.storage
                .from('vehicle-docs')
                .upload(path, file, { upsert: false, contentType: file.type })

            if (uploadErr) {
                toast.error('Error al subir el archivo: ' + uploadErr.message)
                setLoading(false)
                return
            }

            const { data: publicUrl } = supabase.storage.from('vehicle-docs').getPublicUrl(path)
            file_url = publicUrl.publicUrl
            file_name = file.name
        }

        const { error } = await supabase.from('vehicle_documents').insert({
            user_id: user.id,
            vehicle_id: vehicleId,
            name: docType,
            file_url,
            file_name,
            expiry_date: expiry_date || null,
        } as any)

        setLoading(false)

        if (error) {
            toast.error('Error al guardar: ' + error.message)
        } else {
            toast.success('✅ Documento vehicular guardado')
            setOpen(false)
            setFile(null)
            setDocType('VTV / RTO')
            router.refresh()
        }
    }

    return (
        <>
            {/* Trigger */}
            {children ? (
                <span onClick={() => setOpen(true)} className="contents cursor-pointer">{children}</span>
            ) : (
                <Button
                    onClick={() => setOpen(true)}
                    className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20"
                    variant="outline"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Vencimiento
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px] glass border-amber-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-amber-500" />
                            Alta de Documento Vehicular
                        </DialogTitle>
                        <DialogDescription>
                            Registrá el vencimiento y podés adjuntar el PDF o foto del documento.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tipo de Documento</Label>
                            <input type="hidden" name="name" value={docType} />
                            <Select value={docType} onValueChange={(v: string | null) => { if (v) setDocType(v) }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VTV / RTO">VTV / RTO</SelectItem>
                                    <SelectItem value="Seguro">Póliza de Seguro</SelectItem>
                                    <SelectItem value="Patente">Patente (Matrícula)</SelectItem>
                                    <SelectItem value="Cedula">Cédula Verde / Azul</SelectItem>
                                    <SelectItem value="Registro">Registro de Conducir</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiry_date">Fecha de Vencimiento</Label>
                            <Input id="expiry_date" name="expiry_date" type="date" required />
                        </div>

                        {/* Zona de drag & drop para subir PDF/imagen */}
                        <div className="space-y-2">
                            <Label>Adjuntar PDF o Foto <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                            <div
                                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${dragOver ? 'border-amber-500 bg-amber-500/10' : 'border-border/50 hover:border-amber-500/50 hover:bg-muted/10'
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                {file ? (
                                    <div className="flex items-center justify-between px-2" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.type)}
                                            <div className="text-left">
                                                <p className="text-sm font-medium truncate max-w-[260px]">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={removeFile} className="p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <UploadCloud className="h-7 w-7 opacity-40" />
                                        <p className="text-sm font-medium">Subí el PDF o foto del documento</p>
                                        <p className="text-xs opacity-60">Para mostrarlo en controles de tránsito</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-amber-500 text-black hover:bg-amber-600">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {loading ? 'Guardando...' : 'Guardar Documento'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
