import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Wrench, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MantenimientoForm } from '@/components/vehiculo/mantenimiento-form'
import { Badge } from '@/components/ui/badge'

export default async function MantenimientoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch
    const { data: services } = await supabase
        .from('vehicle_maintenances')
        .select('*')
        .eq('user_id', user?.id || '')
        .order('date', { ascending: false })

    const list = (services || []) as any[]

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Historial de Services</h1>
                    <p className="text-muted-foreground mt-1">
                        Lleva el registro de mantenimiento preventivo y de rutina del auto.
                    </p>
                </div>
                <MantenimientoForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">

                {/* HISTORIAL TABLA */}
                <div className="flex flex-col gap-6 md:col-span-8">
                    <Card className="glass flex-1 flex flex-col border-blue-500/10 min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-blue-500/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5 text-blue-500" />
                                    Registro de Taller
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {list.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-[300px]">
                                        <Wrench className="h-12 w-12 text-blue-500 mb-4 opacity-50" />
                                        <p className="text-sm">Aún no hay services registrados.</p>
                                    </div>
                                ) : (
                                    list.map((srv) => (
                                        <div key={srv.id} className="relative bg-muted/20 p-5 rounded-xl border-l-4 border-blue-500/50 hover:bg-muted/40 transition-colors border-y border-r border-border/50">
                                            <div className="flex justify-between items-start mb-2 border-b border-border/30 pb-2">
                                                <div>
                                                    <h4 className="font-bold text-foreground text-lg">{srv.type}</h4>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {new Date(srv.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {srv.cost && (
                                                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 font-mono border-blue-500/30">
                                                        ${srv.cost}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                                                {srv.mileage_km && (
                                                    <div><span className="text-muted-foreground">KMs:</span> <span className="font-semibold">{srv.mileage_km.toLocaleString()}</span></div>
                                                )}
                                                {srv.next_date && (
                                                    <div><span className="text-muted-foreground">Próximo aviso:</span> <span className="font-semibold text-amber-500">{new Date(srv.next_date).toLocaleDateString()}</span></div>
                                                )}
                                            </div>
                                            {srv.notes && (
                                                <p className="text-sm mt-3 pt-3 border-t border-dashed border-border/50 text-foreground/80 italic">
                                                    "{srv.notes}"
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SIDEBAR ESPACIO RESERVADO GRAFICOS */}
                <div className="flex flex-col gap-6 md:col-span-4">
                    <Card className="glass flex-1 flex flex-col border-amber-500/10">
                        <CardHeader className="bg-amber-500/5 border-b border-border/50">
                            <CardTitle className="text-amber-500 flex gap-2 items-center text-lg"><ShieldAlert className="h-5 w-5" /> Recordatorio de Vencimiento de Aceite</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 text-center lg:text-left text-sm opacity-80 flex-1 flex items-center justify-center">
                            La aplicación cruzará en el futuro tu kilometraje del "TCO" y la última fecha de visita, calculando de manera predictiva cuántos meses quedan para cambiar tus filtros usando Analytics predictivo.
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
