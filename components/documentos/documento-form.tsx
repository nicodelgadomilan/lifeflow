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

export function DocumentoForm({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState('Personal')
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

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formEl = e.currentTarget
        const name = (formEl.elements.namedItem('name') as HTMLInputElement).value
        const expiry_date = (formEl.elements.namedItem('expiry_date') as HTMLInputElement).value
        const notes = (formEl.elements.namedItem('notes') as HTMLInputElement).value

        if (!name || !category) {
            toast.error('Nombre y categoría son obligatorios')
            setLoading(false)
            return
        }

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { toast.error('No autenticado'); setLoading(false); return }

        let file_url = '#'
        let file_name: string | null = null
        let file_size: number | null = null
        let mime_type: string | null = null

        // Upload archivo a Supabase Storage
        if (file) {
            const ext = file.name.split('.').pop()
            const path = `${user.id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`
            const { data: uploaded, error: uploadErr } = await supabase.storage
                .from('documents')
                .upload(path, file, { upsert: false, contentType: file.type })

            if (uploadErr) {
                toast.error('Error al subir el archivo: ' + uploadErr.message)
                setLoading(false)
                return
            }

            const { data: publicUrl } = supabase.storage.from('documents').getPublicUrl(path)
            file_url = publicUrl.publicUrl
            file_name = file.name
            file_size = file.size
            mime_type = file.type
        }

        const { error } = await supabase.from('documents').insert({
            user_id: user.id,
            name,
            category,
            file_url,
            file_name,
            file_size,
            mime_type,
            expiry_date: expiry_date || null,
            notes: notes || null
        } as any)

        setLoading(false)

        if (error) {
            toast.error('Error al registrar: ' + error.message)
        } else {
            toast.success('✅ Documento guardado correctamente')
            setOpen(false)
            setFile(null)
            setCategory('Personal')
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
                    className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    variant="outline"
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Subir Documento
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px] glass border-primary/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5 text-primary" />
                            Añadir Documento
                        </DialogTitle>
                        <DialogDescription>
                            Podés subir un PDF o imagen directamente. Se guarda en tu bóveda privada.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Zona de drag & drop */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-muted/10'
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
                                    <UploadCloud className="h-8 w-8 opacity-40" />
                                    <p className="text-sm font-medium">Arrastrá un archivo o hacé click</p>
                                    <p className="text-xs opacity-60">PDF, JPG, PNG hasta 10 MB</p>
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

                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del documento</Label>
                            <Input id="name" name="name" placeholder="Ej: DNI, Contrato, Recibo de sueldo..." required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <input type="hidden" name="category" value={category} />
                                <Select value={category} onValueChange={(v: string | null) => { if (v) setCategory(v) }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                        <SelectItem value="Laboral">Laboral</SelectItem>
                                        <SelectItem value="Médico">Médico</SelectItem>
                                        <SelectItem value="Legal">Legal / Notarial</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry_date">Vencimiento (Opcional)</Label>
                                <Input id="expiry_date" name="expiry_date" type="date" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas o ubicación física</Label>
                            <Input id="notes" name="notes" placeholder="Ej: Cajón primera gaveta, ID #4890" />
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {loading ? 'Subiendo...' : 'Guardar Documento'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
