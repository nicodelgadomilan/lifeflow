import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ReparacionForm } from '@/components/vehiculo/reparacion-form'
import { ReparacionItem } from '@/components/vehiculo/reparacion-item'

export default async function ReparacionesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: reps } = await supabase
        .from('vehicle_repairs')
        .select('*')
        .eq('user_id', user?.id || '')
        .order('status', { ascending: false }) // pending first
        .order('priority', { ascending: false }) // urgent first

    const list = (reps || []) as any[]

    const pendientes = list.filter(r => r.status === 'pending')
    const completadas = list.filter(r => r.status === 'done')

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reparaciones & Fallas</h1>
                    <p className="text-muted-foreground mt-1">
                        Control preventivo de alertas mecánicas.
                    </p>
                </div>
                <ReparacionForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                {/* PENDIENTES */}
                <div className="flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-rose-500/10 min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-rose-500/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-rose-500" />
                                    Problemas sin resolver
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {pendientes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-[300px]">
                                        <Wrench className="h-12 w-12 text-rose-500 mb-4 opacity-50" />
                                        <p className="text-sm">Todo en perfectas condiciones. Ninguna alerta pendiente.</p>
                                    </div>
                                ) : (
                                    pendientes.map((rep) => <ReparacionItem key={rep.id} repair={rep} />)
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* HISTORIAL OK */}
                <div className="flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-none min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-muted/5 pb-4">
                            <div>
                                <CardTitle className="text-lg opacity-80 flex gap-2 items-center">
                                    <Wrench className="h-5 w-5 text-emerald-500" />
                                    Reparaciones ya solucionadas
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {completadas.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-30 h-[300px]">
                                        <Wrench className="h-10 w-10 mb-4" />
                                        <p className="text-sm">Historial de solución de fallas vacío.</p>
                                    </div>
                                ) : (
                                    completadas.map((rep) => <ReparacionItem key={rep.id} repair={rep} />)
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
