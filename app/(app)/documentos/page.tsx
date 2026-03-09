import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, FileText, Lock, FileDigit, HardDrive } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DocumentoForm } from '@/components/documentos/documento-form'
import { DocumentoItem } from '@/components/documentos/documento-item'

export default async function DocumentosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const list = (docs || []) as any[]

    const getCount = (cat: string) => list.filter(d => d.category === cat).length

    // Sort valid expire dates first. (Expired vs Non expired is handled in component)
    const comingExpiryDocs = [...list]
        .filter(d => d.expiry_date)
        .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())

    return (
        <div className="space-y-6 animate-fade-in mx-auto max-w-6xl pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bóveda de Documentos</h1>
                    <p className="text-muted-foreground mt-1">
                        Organiza tus papeles importantes.
                    </p>
                </div>
                <DocumentoForm />
            </div>

            {/* FOLDERS WIDGETS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card className="glass card-hover border-indigo-500/20 bg-indigo-500/5 cursor-pointer">
                    <CardContent className="p-4 flex gap-4 items-center">
                        <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-500"><FileText className="h-6 w-6" /></div>
                        <div>
                            <h4 className="font-bold text-sm text-indigo-500">Personales</h4>
                            <p className="text-xs text-muted-foreground">{getCount('Personal')} archivos</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5 cursor-pointer">
                    <CardContent className="p-4 flex gap-4 items-center">
                        <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500"><FileDigit className="h-6 w-6" /></div>
                        <div>
                            <h4 className="font-bold text-sm text-emerald-500">Laborales</h4>
                            <p className="text-xs text-muted-foreground">{getCount('Laboral')} archivos</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-amber-500/20 bg-amber-500/5 cursor-pointer">
                    <CardContent className="p-4 flex gap-4 items-center">
                        <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500"><Lock className="h-6 w-6" /></div>
                        <div>
                            <h4 className="font-bold text-sm text-amber-500">Legales</h4>
                            <p className="text-xs text-muted-foreground">{getCount('Legal')} archivos</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-primary/20 bg-primary/5 cursor-pointer group">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center pb-2">
                        <HardDrive className="h-5 w-5 text-primary mb-2 opacity-50 transition-transform group-hover:scale-110" />
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest leading-tight">
                            Drive Cifrado<br />(Fase 3)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">

                {/* EXPLORADOR DE ARCHIVOS */}
                <div className="flex flex-col gap-6 md:col-span-8 lg:col-span-9">
                    <Card className="glass flex-1 flex flex-col border-border/50 min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-muted/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FolderOpen className="h-5 w-5 text-foreground/80" />
                                    Archivos Recientes
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {list.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-40 h-[300px]">
                                        <FolderOpen className="h-16 w-16 mb-4" />
                                        <p className="text-sm">Bóveda vacía. Comienza registrando tu DNI o documentos vitales.</p>
                                    </div>
                                ) : (
                                    list.map((doc) => <DocumentoItem key={doc.id} doc={doc} />)
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RECORDATORIOS VENCIMIENTO */}
                <div className="flex flex-col gap-6 md:col-span-4 lg:col-span-3">
                    <Card className="glass flex-1 flex flex-col border-none min-h-[500px]">
                        <CardHeader className="bg-foreground/5 border-b border-border/50 pb-4">
                            <CardTitle className="text-sm flex gap-2 items-center uppercase tracking-widest text-muted-foreground">
                                Próximos a Vencer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-sm flex-1">
                            {comingExpiryDocs.length === 0 ? (
                                <div className="text-center text-muted-foreground opacity-50 mt-10">
                                    No hay documentos con fecha de caducidad.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comingExpiryDocs.map(doc => {
                                        const isExpired = new Date(doc.expiry_date) < new Date()
                                        return (
                                            <div key={'exp_' + doc.id} className="border-l-2 pl-3 py-1 flex flex-col gap-1 border-border/50 hover:border-foreground/50 transition-colors">
                                                <span className={`text-xs font-bold ${isExpired ? 'text-rose-500' : 'text-foreground'}`}>{doc.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{new Date(doc.expiry_date).toLocaleDateString()}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
