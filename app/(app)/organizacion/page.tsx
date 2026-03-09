import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TaskFormDialog } from '@/components/organizacion/task-form'
import { TaskItem } from '@/components/organizacion/task-item'
import { NoteItem } from '@/components/organizacion/note-item'
import { NoteFormDialog } from '@/components/organizacion/note-form'

export default async function OrganizacionPage() {
    const supabase = await createClient()

    // 1. Fetch Tareas
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('status', { ascending: false }) // in_progress/pending primero, done al final
        .order('priority', { ascending: true })
        .order('due_date', { ascending: true })

    // 2. Fetch Notas
    const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

    // 3. (Mock) Calendar Events - For Phase 2 we use a mock until we link it
    const upcomingEvents = [
        { title: 'Reunión de Diseño UI', start: new Date(new Date().setHours(14, 0)), type: 'meeting' },
        { title: 'Turno Dentista', start: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'event' },
    ]

    const pendingTasks = ((tasks || []) as any[]).filter((t: any) => t.status !== 'done')
    const completedTasks = ((tasks || []) as any[]).filter((t: any) => t.status === 'done')

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organización</h1>
                    <p className="text-muted-foreground mt-1">
                        Tu hub central de tareas, notas rápidas y calendario.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* COLUMNA IZQUIERDA: GESTOR DE TAREAS */}
                <div className="md:col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col min-h-[500px]">
                        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    Tareas Pendientes
                                </CardTitle>
                                <CardDescription>
                                    Basado en prioridad temporal
                                </CardDescription>
                            </div>
                            <TaskFormDialog />
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {pendingTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-full">
                                        <CheckCircle2 className="h-12 w-12 text-primary mb-4 opacity-50" />
                                        <p className="text-sm">No tienes tareas pendientes. ¡Excelente trabajo!</p>
                                    </div>
                                ) : (
                                    pendingTasks.map((t: any) => (
                                        <TaskItem key={t.id} task={t} />
                                    ))
                                )}

                                {/* Completadas Section */}
                                {completedTasks.length > 0 && (
                                    <div className="mt-8 pt-4 border-t border-border/50">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 pl-2">
                                            Completadas ({completedTasks.length})
                                        </p>
                                        <div className="space-y-3 opacity-60">
                                            {completedTasks.slice(0, 5).map((t: any) => (
                                                <TaskItem key={t.id} task={t} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUMNA DERECHA: NOTAS Y CALENDARIO */}
                <div className="md:col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-6">

                    {/* Widget Calendario */}
                    <Card className="glass border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                Eventos Próximos
                            </CardTitle>
                            <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Ir a Calendario</span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingEvents.map((evt, i) => (
                                    <div key={i} className="flex gap-3 items-start border-l-2 border-primary/50 pl-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{evt.title}</p>
                                            <div className="text-xs text-muted-foreground flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {evt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <span className="mx-1">•</span>
                                                {evt.start.toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bloc de Notas Pinned */}
                    <Card className="glass flex-1 flex flex-col border-amber-500/20">
                        <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between bg-amber-500/5">
                            <div>
                                <CardTitle className="text-base text-amber-500">Notas Rápidas</CardTitle>
                            </div>
                            <NoteFormDialog />
                        </CardHeader>
                        <CardContent className="p-4 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-4">
                                {notes?.length === 0 ? (
                                    <div className="text-center p-6 text-sm text-amber-500/60 border border-dashed border-amber-500/30 rounded-lg">
                                        No tienes notas. Guarda aquí links, direcciones o apuntes importantes.
                                    </div>
                                ) : (
                                    notes?.map((n: any) => (
                                        <NoteItem key={n.id} note={n} />
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
