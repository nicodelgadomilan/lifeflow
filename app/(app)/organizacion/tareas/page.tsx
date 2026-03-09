import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ListTodo, CircleDashed, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TaskFormDialog } from '@/components/organizacion/task-form'
import { TaskItem } from '@/components/organizacion/task-item'
import { Badge } from '@/components/ui/badge'

export default async function TareasPage() {
    const supabase = await createClient()

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('priority', { ascending: true })
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: false })

    const allTasks = (tasks || []) as any[]

    const pendingTasks = allTasks.filter(t => t.status === 'pending')
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress')
    const completedTasks = allTasks.filter(t => t.status === 'done')

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestor de Tareas</h1>
                    <p className="text-muted-foreground mt-1">
                        Controla tus pendientes de forma detallada por categoría y estado.
                    </p>
                </div>
                <TaskFormDialog />
            </div>

            {/* Top Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass card-hover border-blue-500/20 bg-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-500">
                            Por Hacer
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <CircleDashed className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-500">{pendingTasks.length}</div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-amber-500/20 bg-amber-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-500">
                            En Proceso
                        </CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-full">
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-500">{inProgressTasks.length}</div>
                    </CardContent>
                </Card>

                <Card className="glass card-hover border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-500">
                            Completadas
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">{completedTasks.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* COLUMNA PENDIENTES & PROCESO */}
                <div className="flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-none">
                        <CardHeader className="border-b border-border/50 bg-muted/5 flex flex-row items-center gap-2 pb-4">
                            <ListTodo className="h-5 w-5 text-primary" />
                            <CardTitle>Cola de Trabajo</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col h-[600px]">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {pendingTasks.length === 0 && inProgressTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-full">
                                        <CheckCircle2 className="h-12 w-12 text-primary mb-4 opacity-50" />
                                        <p className="text-sm">Todo al día. No hay tareas en curso.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* IN PROGRESS SECTION */}
                                        {inProgressTasks.length > 0 && (
                                            <div className="mb-6">
                                                <Badge variant="outline" className="mb-3 text-amber-500 border-amber-500/30 bg-amber-500/10 uppercase tracking-widest text-[10px]">
                                                    En Proceso Ahora
                                                </Badge>
                                                <div className="space-y-3">
                                                    {inProgressTasks.map(t => <TaskItem key={t.id} task={t} />)}
                                                </div>
                                            </div>
                                        )}

                                        {/* PENDING SECTION */}
                                        {pendingTasks.length > 0 && (
                                            <div>
                                                <Badge variant="outline" className="mb-3 text-blue-500 border-blue-500/30 bg-blue-500/10 uppercase tracking-widest text-[10px]">
                                                    Próximas
                                                </Badge>
                                                <div className="space-y-3">
                                                    {pendingTasks.map(t => <TaskItem key={t.id} task={t} />)}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUMNA COMPLETADAS & ARCHIVO */}
                <div className="flex flex-col gap-6">
                    <Card className="glass flex-1 flex flex-col border-none">
                        <CardHeader className="border-b border-border/50 bg-emerald-500/5 flex flex-row items-center gap-2 pb-4">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <CardTitle>Achieve & Histórico</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col h-[600px]">
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {completedTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-full">
                                        <ListTodo className="h-12 w-12 mb-4 opacity-30" />
                                        <p className="text-sm">Aquí se mostrarán tus tareas marcadas como listas.</p>
                                    </div>
                                ) : (
                                    completedTasks.map(t => (
                                        <div key={t.id} className="opacity-70 scale-[0.98]">
                                            <TaskItem task={t} />
                                        </div>
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
