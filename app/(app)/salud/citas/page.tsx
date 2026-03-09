import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Stethoscope, BriefcaseMedical } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CitasForm } from '@/components/salud/citas-form'
import { AppointmentItem } from '@/components/salud/citas-item'

export default async function CitasBasicasPage() {
    const supabase = await createClient()

    const { data: appts } = await supabase
        .from('health_appointments')
        .select('*')
        .order('date', { ascending: false })

    const appointments = (appts || []) as any[]

    const now = new Date()
    const upcoming = appointments.filter(a => new Date(a.date) >= now).reverse()
    const past = appointments.filter(a => new Date(a.date) < now)

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Turnos Médicos</h1>
                    <p className="text-muted-foreground mt-1">
                        Control general de especialistas clínicos.
                    </p>
                </div>
                <CitasForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* PRÓXIMAS */}
                <div className="flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-rose-500/10 min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-rose-500/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-rose-500" />
                                    Próximas Visitas Agendadas
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {upcoming.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-[300px]">
                                        <BriefcaseMedical className="h-12 w-12 text-rose-500 mb-4 opacity-50" />
                                        <p className="text-sm">Todo al día. Ningún turno programado en puerta.</p>
                                    </div>
                                ) : (
                                    upcoming.map((appt) => <AppointmentItem key={appt.id} appointment={appt} />)
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* HISTORIAL */}
                <div className="flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-none min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-muted/5 pb-4">
                            <div>
                                <CardTitle className="text-lg opacity-80">
                                    Historial de Atenciones
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {past.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-30 h-[300px]">
                                        <Stethoscope className="h-10 w-10 mb-4" />
                                        <p className="text-sm">No hay consultas médicas pasadas registradas.</p>
                                    </div>
                                ) : (
                                    past.map((appt) => <AppointmentItem key={appt.id} appointment={appt} />)
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
