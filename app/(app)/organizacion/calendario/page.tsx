import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, Clock, Users, CalendarDays, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CalendarEventForm } from '@/components/organizacion/calendar-form'
import { CalendarEventItem } from '@/components/organizacion/calendar-item'
import { Badge } from '@/components/ui/badge'

export default async function CalendarioPage() {
    const supabase = await createClient()

    // 1. Fetch Eventos
    const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true })

    const calendarEvents = (events || []) as any[]

    // Categorize today and upcoming
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayEvents = calendarEvents.filter(evt => {
        const d = new Date(evt.start_date)
        return d >= today && d < tomorrow
    })

    const upcomingEvents = calendarEvents.filter(evt => {
        const d = new Date(evt.start_date)
        return d >= tomorrow
    })

    const pastEvents = calendarEvents.filter(evt => {
        const d = new Date(evt.start_date)
        return d < today
    })

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendario de Eventos</h1>
                    <p className="text-muted-foreground mt-1">
                        Tu agenda de actividades y reuniones próximas.
                    </p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="glass card-hover border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary">
                            Hoy
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{todayEvents.length}</div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Próximamente
                        </CardTitle>
                        <div className="p-2 bg-muted/20 rounded-full">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{upcomingEvents.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* AGENDA VISTA LISTA (IZQUIERDA) */}
                <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-none min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-muted/5 flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                    Agenda Principal
                                </CardTitle>
                                <CardDescription>Vista cronológica de tus citas</CardDescription>
                            </div>
                            <CalendarEventForm />
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                                {/* HOY */}
                                <div>
                                    <h3 className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                                        Hoy • {today.toLocaleDateString()}
                                    </h3>
                                    {todayEvents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground/60 p-4 border border-dashed rounded-lg bg-muted/5">No hay eventos para hoy. ¡Disfruta el día libre!</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {todayEvents.map(evt => <CalendarEventItem key={evt.id} event={evt} />)}
                                        </div>
                                    )}
                                </div>

                                {/* PRÓXIMAMENTE */}
                                <div>
                                    <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
                                        Próximamente
                                    </h3>
                                    {upcomingEvents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground/60 p-4 border border-dashed rounded-lg bg-muted/5">Nada agendado para el futuro cercano.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Group by date for upcoming */}
                                            {Object.entries(
                                                upcomingEvents.reduce((acc, evt) => {
                                                    const dateStr = new Date(evt.start_date).toLocaleDateString()
                                                    if (!acc[dateStr]) acc[dateStr] = []
                                                    acc[dateStr].push(evt)
                                                    return acc
                                                }, {} as Record<string, any[]>)
                                            ).map(([date, evts]: [string, any]) => (
                                                <div key={date}>
                                                    <Badge variant="outline" className="mb-2 text-[10px] opacity-70 border-muted bg-muted/30">📅 {date}</Badge>
                                                    <div className="space-y-2 pl-2">
                                                        {evts.map((e: any) => <CalendarEventItem key={e.id} event={e} />)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* HISTORIAL Y EXTRA */}
                <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-none bg-muted/5">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="text-lg">Eventos Pasados</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col h-[500px]">
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 opacity-60">
                                {pastEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-full">
                                        <Clock className="h-10 w-10 mb-4 opacity-30" />
                                        <p className="text-xs">El historial está vacío.</p>
                                    </div>
                                ) : (
                                    pastEvents.slice(-10).reverse().map(evt => (
                                        <CalendarEventItem key={evt.id} event={evt} />
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
