import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Wrench, FileText, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function VehiculoResumenPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Resumen Rapariaciones pendientes
    const { data: repairs } = await supabase
        .from('vehicle_repairs')
        .select('*')
        .eq('user_id', user?.id || '')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    const pendientes = (repairs || []) as any[]
    const fallasUrgentes = pendientes.filter(r => r.priority === 'urgent').length

    // Vehiculos count
    const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id || '')

    const totalVehicles = vehiclesData?.length || 0

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bitácora Automotriz</h1>
                    <p className="text-muted-foreground mt-1">
                        Control total sobre el mantenimiento y papeles de tus vehículos.
                    </p>
                </div>
            </div>

            {/* Quick Links / Navigation Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/vehiculo/mantenimiento">
                    <Card className="glass card-hover border-blue-500/20 bg-blue-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-blue-500 group-hover:underline">
                                Mantenimientos
                            </CardTitle>
                            <Car className="h-6 w-6 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{totalVehicles > 0 ? 'Activo' : 'Sin auto'}</div>
                            <p className="text-xs text-blue-500/70 mt-1">Historial de cambios de aceite y services</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/vehiculo/reparaciones">
                    <Card className="glass card-hover border-rose-500/20 bg-rose-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-rose-500 group-hover:underline">
                                Fallas & Reparaciones
                            </CardTitle>
                            <Wrench className="h-6 w-6 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-500">{pendientes.length} pendientes</div>
                            {fallasUrgentes > 0 ? (
                                <p className="text-xs text-rose-500 mt-1 flex items-center font-bold">
                                    <AlertTriangle className="h-3 w-3 mr-1" /> {fallasUrgentes} Críticos prioritarios
                                </p>
                            ) : (
                                <p className="text-xs text-rose-500/70 mt-1">Todo mecánico en orden</p>
                            )}
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/vehiculo/documentos">
                    <Card className="glass card-hover border-amber-500/20 bg-amber-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-amber-500 group-hover:underline">
                                Papeles y VTV
                            </CardTitle>
                            <FileText className="h-6 w-6 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-amber-500">Vencimientos</div>
                            <p className="text-xs text-amber-500/70 mt-1">VTV, Seguro, Registro de conducir</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* WIDGET STATUS */}
                <Card className="glass border-border/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertTriangle className="h-5 w-5 text-rose-500" /> Alertas Mecánicas
                        </CardTitle>
                        <CardDescription>Resumen de problemas o alertas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {fallasUrgentes > 0 ? (
                            <div className="p-4 border border-rose-500/30 rounded-lg bg-rose-500/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-rose-500">Atención requerida</span>
                                </div>
                                <p className="text-sm text-foreground/80 font-medium">Tienes fallas marcadas como urgentes que podrían afectar la seguridad o el funcionamiento del vehículo. Programa una visita al taller.</p>
                                <div className="mt-4 pt-4 border-t border-rose-500/20">
                                    <Link href="/vehiculo/reparaciones" className="text-sm font-bold text-rose-500 uppercase flex items-center gap-1 hover:underline">
                                        Ver pendientes <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-muted-foreground bg-emerald-500/5 rounded-lg border border-dashed border-emerald-500/20 text-sm">
                                No hay alertas graves. El vehículo está en buen estado general aparente.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* PROGRESO ESTADISTICO WIDGET FASCIA 3 */}
                <Card className="glass border-border/50 opacity-70">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                            <Car className="h-5 w-5" /> Costo Integral de Mantenimiento
                        </CardTitle>
                        <CardDescription>KPIs de TCO (Desarrollo Fase 3)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8 border-t border-border/20">
                        <p className="text-sm text-center">Aquí se habilitarán reportes financieros con cruce a la pantalla de Finanzas: Cuánto te costó tu vehículo por kilómetro, total de combustible/service anual.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
