import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PapelesForm } from '@/components/vehiculo/papel-form'
import { PapelItem } from '@/components/vehiculo/papel-item'

export default async function DocumentosVehiculoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: docs } = await supabase
        .from('vehicle_documents')
        .select('*')
        .eq('user_id', user?.id || '')
        .order('expiry_date', { ascending: true })

    const list = (docs || []) as any[]

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Papeles y Vencimientos</h1>
                    <p className="text-muted-foreground mt-1">
                        Evita multas llevando el control de vigencia de seguros y VTV.
                    </p>
                </div>
                <PapelesForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">

                {/* AGENDA VENCIMIENTOS */}
                <div className="flex flex-col gap-6 md:col-span-8">
                    <Card className="glass flex-1 flex flex-col border-amber-500/10 min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-amber-500/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-amber-500" />
                                    Agenda de Vencimientos
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {list.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-[300px]">
                                        <FileText className="h-12 w-12 text-amber-500 mb-4 opacity-50" />
                                        <p className="text-sm">Agrega el próximo vencimiento de tu seguro o registro.</p>
                                    </div>
                                ) : (
                                    list.map((doc) => <PapelItem key={doc.id} doc={doc} />)
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* INFO VTV */}
                <div className="flex flex-col gap-6 md:col-span-4">
                    <Card className="glass flex-1 flex flex-col border-none min-h-[500px] p-6 text-center">
                        <ShieldAlert className="h-12 w-12 mx-auto text-amber-500 mb-4 opacity-50" />
                        <p className="text-sm text-foreground/80 font-medium">
                            Conducir con la VTV, RTO o tu seguro automotor vencido es causal de retención inmediata del vehículo en la mayoría de los controles de tránsito.
                        </p>
                        <div className="mt-auto border border-dashed border-border/70 p-4 rounded-xl opacity-60">
                            En la Fase 3, podrás adjuntar y visualizar aquí mismo el PDF de tu póliza para mostrarlo en el celular a los agentes desde esta pantalla.
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    )
}
