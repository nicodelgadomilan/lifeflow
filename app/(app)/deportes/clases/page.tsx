import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Dumbbell, ActivitySquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SportClassForm } from '@/components/deportes/class-form'
import { SportClassItem } from '@/components/deportes/class-item'

export default async function ClasesDeportivasPage() {
    const supabase = await createClient()

    const { data: classes } = await supabase
        .from('sport_classes')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

    const classItems = (classes || []) as any[]

    // Agrupar por días para renderizado
    const daysMap = [
        { name: 'Domingo', num: 0 },
        { name: 'Lunes', num: 1 },
        { name: 'Martes', num: 2 },
        { name: 'Miércoles', num: 3 },
        { name: 'Jueves', num: 4 },
        { name: 'Viernes', num: 5 },
        { name: 'Sábado', num: 6 }
    ]

    const hasClasses = classItems.length > 0

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Clases</h1>
                    <p className="text-muted-foreground mt-1">
                        Tu rutina fija de entrenamiento, padel, yoga, natación, etc.
                    </p>
                </div>
                <SportClassForm />
            </div>

            {/* Resumen Semanal */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass card-hover border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary">
                            Clases Semanales
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <ActivitySquare className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{classItems.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* LISTA VISTA SEMANA */}
                <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-none min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-muted/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                    Horario Semanal Fijado
                                </CardTitle>
                                <CardDescription>Orden de tus días de actividad</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            <div className="p-6 space-y-6">
                                {!hasClasses ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-full mt-10 border border-dashed rounded-xl">
                                        <Dumbbell className="h-12 w-12 text-primary mb-4 opacity-50" />
                                        <p className="text-sm border-blue-500">No hay ninguna clase registrada. ¡Empieza añadiendo tu primera actividad!</p>
                                    </div>
                                ) : (
                                    daysMap.map((dayObj) => {
                                        const dayClasses = classItems.filter(c => c.day_of_week === dayObj.num)
                                        if (dayClasses.length === 0) return null

                                        return (
                                            <div key={dayObj.num} className="space-y-3">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80 mb-3 border-b border-border/50 pb-2">
                                                    {dayObj.name}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {dayClasses.map(c => (
                                                        <SportClassItem key={c.id} sportClass={c} />
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* AYUDA / INFORMACION SIDEBAR */}
                <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <Card className="glass h-fit border-dashed border-primary/30 text-center flex flex-col items-center">
                        <CardContent className="p-6 space-y-4">
                            <Dumbbell className="h-10 w-10 text-primary opacity-50 mx-auto" />
                            <h3 className="font-semibold text-primary">Constancia</h3>
                            <p className="text-sm text-muted-foreground">
                                Agendar y bloquear en el sistema tus horarios fijos para el deporte, aumenta un 75% las probabilidades de no posponerlos por otras tareas urgentes.
                            </p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
