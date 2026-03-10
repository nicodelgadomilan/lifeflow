import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Landmark, ListChecks, CheckCircle2, History } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ServicioForm } from '@/components/finanzas/servicio-form'
import { ServiciosMonthlyView } from '@/components/finanzas/servicios-monthly-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServicioItem } from '@/components/finanzas/servicio-item'

export default async function ServiciosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('is_paid', { ascending: true }) // false first (pendings)
        .order('due_date', { ascending: true })

    const list = (services || []) as any[]

    const pendientes = list.filter(s => !s.is_paid)
    // Ultimos 10 pagos para que no reviente la pantalla (o ordernar por fecha)
    const pagados = list.filter(s => s.is_paid).sort((a, b) => new Date(b.paid_date).getTime() - new Date(a.paid_date).getTime()).slice(0, 10)

    const totalToPay = pendientes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in mx-auto max-w-5xl pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona el pago de servicios y próximos vencimientos.
                    </p>
                </div>
                <ServicioForm />
            </div>

            {/* FOLDERS WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card className="glass flex flex-col justify-center border-l-4 border-l-primary/50 bg-primary/5 p-6 space-y-2 relative overflow-hidden group">
                    <Landmark className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 opacity-10 h-32 w-32 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-sm text-primary flex items-center gap-2"><ListChecks className="h-4 w-4" /> A Liquidar este mes</h4>
                    <p className="text-3xl font-black text-foreground">${totalToPay.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-muted-foreground">{pendientes.filter(p => !p.amount).length} servicios no tienen importe asignado aún</p>
                </Card>

                <Card className="glass file flex flex-col justify-center border-border/50 p-6 space-y-2 bg-gradient-to-r from-muted/10 to-transparent">
                    <h4 className="font-bold text-sm text-muted-foreground font-mono uppercase tracking-widest text-center w-full">Comprobantes</h4>
                    <p className="text-xs text-muted-foreground text-center font-medium opacity-60">En Desarrollo (Fase 3).<br />Podrás subir recibos PDF aquí.</p>
                </Card>
            </div>

            <Tabs defaultValue="monthly" className="mt-8">
                <TabsList className="mb-4">
                    <TabsTrigger value="monthly">Vista Mensual</TabsTrigger>
                    <TabsTrigger value="list">Vista General (Pendiente vs Historial)</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="m-0">
                    <ServiciosMonthlyView services={list} />
                </TabsContent>

                <TabsContent value="list" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

                        {/* SERVICIOS PENDIENTES */}
                        <div className="flex flex-col gap-6">
                            <Card className="glass flex-1 flex flex-col border-rose-500/10 min-h-[500px]">
                                <CardHeader className="border-b border-border/50 bg-rose-500/5 pb-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Landmark className="h-5 w-5 text-rose-500" />
                                            Próximos Vencimientos
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 overflow-y-auto">
                                    <div className="p-4 space-y-4">
                                        {pendientes.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-[300px]">
                                                <CheckCircle2 className="h-12 w-12 text-rose-500 mb-4 opacity-50" />
                                                <p className="text-sm">¡Excelente! Estás al día. Agrega uno nuevo desde el botón superior.</p>
                                            </div>
                                        ) : (
                                            pendientes.map((s) => <ServicioItem key={s.id} service={s} />)
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* HISTORIAL PAGADO */}
                        <div className="flex flex-col gap-6">
                            <Card className="glass flex-1 flex flex-col min-h-[500px] border border-border/50 opacity-90 overflow-hidden outline outline-1 outline-offset-4 outline-emerald-500/10">
                                <CardHeader className="border-b border-border/50 bg-emerald-500/5 pb-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg text-emerald-500">
                                            <History className="h-5 w-5" />
                                            Historial de Pagados (Últimos)
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 overflow-y-auto">
                                    <div className="p-4 space-y-2">
                                        {pagados.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-8 text-center opacity-30 h-[300px]">
                                                <History className="h-10 w-10 mb-4" />
                                                <p className="text-sm">No hay registro de servicios pagados.</p>
                                            </div>
                                        ) : (
                                            pagados.map((s) => <ServicioItem key={s.id} service={s} />)
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </TabsContent>
            </Tabs>
        </div >
    )
}
